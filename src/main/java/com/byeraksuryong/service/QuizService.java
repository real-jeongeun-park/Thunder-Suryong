package com.byeraksuryong.service;

import com.byeraksuryong.domain.Quiz;
import com.byeraksuryong.dto.QuizRequest;
import com.byeraksuryong.domain.Note;
import com.byeraksuryong.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final NoteRepository noteRepository;
    private final AiService aiService;
    private final QuizRepository quizRepository;
    private final ExamRepository examRepository;

    @Autowired
    public QuizService(NoteRepository noteRepository, AiService aiService,
                       QuizRepository quizRepository,
                       SpringDataJpaFolderRepository folderRepository,
                       SpringDataJpaQuizRepository springDataJpaQuizRepository,
                       ExamRepository examRepository) {
        this.noteRepository = noteRepository;
        this.aiService = aiService;
        this.quizRepository = quizRepository;
        this.examRepository = examRepository;
    }

    // 퀴즈 생성 처리 메서드
    public List<String> generateQuiz(QuizRequest request) {

        // 1. inputText 기반 content 우선 적용
        StringBuilder contentBuilder = new StringBuilder();

        if (request.getInputText() != null && !request.getInputText().isEmpty()) {
            contentBuilder.append(request.getInputText());
        } else {
            List<Note> notes = noteRepository.findByNoteIdIn(request.getNoteIds());
            for (Note note : notes) {
                contentBuilder.append(note.getContent()).append("\n");
            }
        }

        // 2. GPT 요청 프롬프트 구성
        String prompt = buildPrompt(
                contentBuilder.toString(),
                request.getProblemTypes(),
                request.getProblemCount()
        );

        // 3. GPT 호출
        List<String> quizList = aiService.useQuizAi(prompt);

        if (quizList == null || quizList.isEmpty()) {
            throw new RuntimeException("GPT 응답이 null 또는 비어있습니다.");
        }

        // 문제 단위로 분리
        List<String> processedList = new ArrayList<>();
        for (String block : quizList) {
            String[] splitByDoubleNewLine = block.split("\\n\\n");
            for (String quizBlock : splitByDoubleNewLine) {
                if (quizBlock.contains("@@")) {
                    processedList.add(quizBlock.trim());
                }
            }
        }
        quizList = processedList;

        // GPT 응답 필터링: null, 공백, @@ 없는 항목 제거
        quizList = quizList.stream()
                .filter(q -> q != null && !q.trim().isEmpty())
                .filter(q -> q.contains("@@"))
                .collect(Collectors.toList());

        if (quizList.isEmpty()) {
            throw new RuntimeException("문제 파싱 후 저장 가능한 항목이 없습니다.");
        }

        // 4. DB 저장
        for (String quizLine : quizList) {
            try {
                String[] parts = quizLine.split("\\s*@@\\s*");  // '@@' 기준 분리

                Quiz quiz = new Quiz();
                quiz.setQuizTitle(request.getQuizTitle());
                quiz.setNoteIds(String.join(",", request.getNoteIds()));
                quiz.setNickname(request.getNickname());


                String solution = null;

                if (parts.length < 2) {
                    // 최소한 질문 + 정답은 있어야 함
                    System.out.println("저장 생략됨 - @@ 부족");
                    continue;
                }

                // [Case 1] 객관식 또는 OX (보기 + 정답 존재 [+ 해설])
                String question = parts[0].trim();
                String middle = parts[1].trim();  // 보기 또는 정답
                String answer = parts.length >= 3 ? parts[2].trim() : "";
                solution = parts.length >= 4 ? parts[3].trim() : "";

                // 보기인지 여부 확인
                boolean isChoiceIncluded = middle.contains("|") || middle.matches(".*(보기|선택).*");

                if (isChoiceIncluded) {
                    // 객관식 또는 OX
                    quiz.setQuestion(question + "@@" + middle);

                    // 보기를 정답으로 잘못 저장하는 문제 방지
                    if (answer.isBlank()) {
                        System.out.println("정답 누락 감지 (객관식/OX): " + quizLine);
                        continue;
                    }

                    List<String> candidateList = List.of(middle.split("\\|"));

                    // 정확히 보기 중 하나와 일치하는 정답을 찾음
                    String matchedAnswer = candidateList.stream()
                            .map(String::trim)
                            .filter(opt -> opt.equalsIgnoreCase(answer.trim()))
                            .findFirst()
                            .orElse(null);

                    // fallback: 일치하는 정답이 없으면 첫 번째 보기 사용
                    if (matchedAnswer == null) {
                        System.out.println("보기 중 정답 없음 → fallback 처리: " + answer);
                        matchedAnswer = candidateList.get(0);
                    }

                    quiz.setAnswer(matchedAnswer.toUpperCase());
                    quiz.setSolution(solution);

                    // 보기 문자열을 보고 ox인지 객관식인지 판단
                    String normalizedChoices = middle.replaceAll("\\s+", "").toUpperCase();
                    if (normalizedChoices.contains("O") && normalizedChoices.contains("X") && normalizedChoices.contains("|")) {
                        quiz.setType("ox");
                    } else {
                        quiz.setType("objective");
                    }
                } else {
                    // 주관식
                    quiz.setQuestion(question);
                    quiz.setAnswer(middle.trim().toUpperCase()); // middle = 정답
                    quiz.setSolution(answer); // answer = 해설
                    quiz.setType("subjective");
                }

                quizRepository.save(quiz);
            } catch (Exception e) {
                System.out.println("저장 중 오류: " + e.getMessage());
            }
        }
        return quizList;
    }

    public void saveQuizResults(List<QuizRequest> requests) {
        if(requests.isEmpty()) return;

        String nickname = requests.get(0).getNickname();
        String examId = examRepository.findByNicknameAndDefaultExam(nickname, true).get(0).getExamId();

        for (QuizRequest request : requests) {
            Quiz quiz = new Quiz();
            quiz.setExamId(examId);
            quiz.setQuizTitle(request.getQuizTitle());
            quiz.setNoteIds(String.join(",", request.getNoteIds()));
            quiz.setQuestion(request.getQuestion());
            quiz.setAnswer(request.getAnswer());
            quiz.setNickname(request.getNickname());
            quiz.setType(request.getType());
            quiz.setSolution(request.getSolution());

            quizRepository.save(quiz);
        }
    }

    public List<Quiz> getQuizzesByNickname(String nickname) {
        return quizRepository.findByNickname(nickname);
    }


    // GPT에게 전달할 프롬프트 구성 메서드
    private String buildPrompt(String content, List<String> types, int count) {
        StringBuilder sb = new StringBuilder();

        sb.append("너는 학생의 노트를 바탕으로 퀴즈를 만드는 AI야.\n");
        sb.append("아래 형식 중 선택된 유형에 맞는 형식만 사용해서 문제를 ").append(count).append("개 생성해줘.\n");
        sb.append("❗ 반드시 형식을 지켜야 하며, 형식을 지키지 않으면 문제는 저장되지 않아.\n");

        sb.append("❗ 절대 a), b), **문제**, Markdown 스타일, 빈칸형, 번호형식은 쓰지 마!\n");
        sb.append("❗ O), X) 또는 보기 번호 형식(O: OX 스타일 등)도 절대 쓰지 마!\n");

        sb.append("❗ 객관식 보기는 반드시 '|' 기호로만 구분하고, 정답은 보기 뒤에 '@@'로 따로 써줘.\n");
        sb.append("예시: 운영체제의 역할은?@@자원 관리|프로세스 실행|인터넷 검색|UI 제공@@인터넷 검색\n");

        sb.append("❗ 주관식 문제는 반드시 '무엇인가?', '~하는 이유는?', '( )에 들어갈 알맞은 말은?' 처럼 의문문이나 빈칸문제로 작성해.\n");
        sb.append("❗ 평서문 형태로는 주관식 문제를 만들지 마!\n");

        sb.append("❗ '정답:', '모두 정답', '객관식', '주관식', 'OX' 등의 단어는 사용하지 마!\n");
        sb.append("❗ 보기 안에 '정답'이라는 단어가 포함되면 문제는 저장되지 않아.\n");

        sb.append("❗ 한 문제는 반드시 한 줄로 작성하고, 줄바꿈 없이 작성해. 문제 하나당 줄바꿈 한 번이 필요해.\n");
        sb.append("❗ 반드시 문제마다 한 줄씩 작성하고 줄바꿈으로 구분해줘. 한 줄에 문제 2개 이상 쓰지 마!\n");
        sb.append("❗ 문제와 선택지, 정답은 '@@' 구분자로만 나누고, 절대 줄바꿈이나 다른 특수기호를 사용하지 마.\n");

        sb.append("❗ 문제의 마지막에는 '@@정답@@해설' 형식으로 해설도 꼭 추가해줘!\n");
        sb.append("예시:\n");
        sb.append("운영체제는 컴퓨터 자원을 효율적으로 관리하고 사용자와 하드웨어 사이를 중재하는 역할을 한다.@@O|X@@X@@운영체제는 사용자가 컴퓨터를 쉽게 사용할 수 있도록 도와준다.\n");
        sb.append("컴퓨터의 기억장치에는 무엇이 저장되는가?@@RAM|ROM|CPU|USB@@RAM@@RAM은 실행 중인 데이터를 임시로 저장하는 장치이다.\n");
        sb.append("❗ 주관식 문제도 해설을 꼭 포함해! 예시:\n");
        sb.append("운영체제의 주요 역할은 무엇인가?@@프로세스 관리@@사용자와 하드웨어 간의 중재 역할을 하며 자원을 효율적으로 관리한다.\n");

        sb.append("선택된 문제 유형(subjective, objective, ox)에 따라 골고루 ").append(count)
                .append("개의 문제를 만들어줘. 각 유형마다 최소한 하나 이상 포함되어야 해.\n");
        int perType = count / types.size();
        for (String type : types) {
            sb.append(type).append(": ").append(perType).append("문제\n");
        }

        if (types.contains("subjective")) {
            sb.append("[주관식 형식 예시]\n");
            sb.append("운영체제는 컴퓨터 자원을 효율적으로 관리하도록 도와주는 ( )이다.@@운영체제\n");
            sb.append("컴퓨터의 기억장치에는 무엇이 저장되는가?@@데이터와 프로그램\n\n");
        }

        if (types.contains("objective")) {
            sb.append("[객관식 형식 예시]\n");
            sb.append("운영체제의 역할로 옳지 않은 것은?@@자원 관리|프로세스 실행|인터넷 검색|UI 제공@@인터넷 검색\n\n");
        }

        if (types.contains("ox")) {
            sb.append("[OX 형식 예시]\n");
            sb.append("운영체제는 하드웨어를 직접 제어하는 프로그램이다.@@O|X@@X\n\n");
        }

        sb.append("[노트 내용]\n").append(content);

        return sb.toString();
    }
}
