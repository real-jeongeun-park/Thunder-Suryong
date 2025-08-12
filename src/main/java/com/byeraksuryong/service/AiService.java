package com.byeraksuryong.service;

import com.byeraksuryong.api.AiApi;
import com.byeraksuryong.domain.Quiz;
import com.byeraksuryong.domain.Style;
import com.byeraksuryong.dto.Response;
import com.byeraksuryong.dto.SubjectInfoList;
import com.byeraksuryong.dto.SyllabusList;
import com.byeraksuryong.repository.StyleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class AiService {
    private final AiApi ai;
    private final StyleRepository styleRepository;

    @Autowired
    public AiService(StyleRepository styleRepository){
        this.styleRepository = styleRepository;
        ai = new AiApi(2500);
    }

    public List<String> useScheduleAi(String request){
        ai.setDefaultPrompt("다음 텍스트들 중 강의명으로 보이는 것들만 뽑아서 나열해줘\n" +
                "참고로 강의명이 끊기는 경우도 있기 때문에, 다른 줄의 단어와 연결해야 할 수도 있어: \n" +
                "응답은 '강의명1, 강의명2, 강의명3, 강의명4, ..., 강의명n' 로 간략하게 해줘.");
        try{
            String result = ai.requestAnswer(request).getResponse();
            List<String> subjectList = Arrays.stream(result.split(", "))
                    .map(String::trim)
                    .toList();

            return subjectList;
        } catch(Exception e){
            System.out.println(e.getMessage());
            return null;
        }
    }

    public SyllabusList useSyllabusAi(String request){
        ai.setDefaultPrompt("다음 텍스트들 중 주/회차와 수업내용으로 보이는 텍스트들만 뽑아서 나열해줘\n" +
                "나열을 할 때는 '주/회차1, 수업내용1' 그리고 줄바꿈을 한 후 다시 '주/회차2, 수업내용2' ..., " +
                "'주/회차n, 수업내용n' 과 같은 식으로 부탁해.");
        try {
            String result = ai.requestAnswer(request).getResponse();
            List<String> resultList = Arrays.stream(result.split("\n"))
                    .map(String::trim)
                    .toList();

            List<String> weekList = new ArrayList<>();
            List<String> contentList = new ArrayList<>();

            for (String whole : resultList) {
                int index = whole.indexOf(",");
                if (index != -1) {
                    String first = whole.substring(0, index).trim();
                    int firstIndex = first.indexOf("주");
                    if(firstIndex != -1){
                        first = first.substring(0, firstIndex+1);
                        first += "차";
                    }
                    String second = whole.substring(index + 1).trim();

                    weekList.add(first);
                    contentList.add(second);
                }
            }

            SyllabusList syllabusList = new SyllabusList();
            syllabusList.setWeekList(weekList);
            syllabusList.setContentList(contentList);

            return syllabusList;
        } catch(Exception e){
            System.out.println(e.getMessage());
            return null;
        }
    }

    public SubjectInfoList usePlansAi(Map<String, Object> body){
        String prompt = buildPrompt(body);

        try{
            String response = ai.requestAnswer(prompt).getResponse();
            System.out.println(response);

            List<String> resultList = Arrays.stream(response.split("\n"))
                    .map(String::trim)
                    .toList();

            List<String> dateList = new ArrayList<>();
            List<String> subjectList = new ArrayList<>();
            List<String> weekList = new ArrayList<>();
            List<String> contentList = new ArrayList<>();

            for(String element : resultList){
                int bracketsIndex = element.indexOf("(");
                if(bracketsIndex == 0){
                    element = element.substring(1, element.length()-1);
                }
                int index = element.indexOf(",");
                int secondIndex = element.indexOf(",", index+1);
                int thirdIndex = element.indexOf(",", secondIndex+1);

                if(index != -1 && secondIndex != -1 && thirdIndex != -1){
                    String date = element.substring(0, index).trim();
                    String subject = element.substring(index+1,secondIndex).trim();
                    String week = element.substring(secondIndex+1, thirdIndex).trim();
                    String content = element.substring(thirdIndex+1).trim();

                    dateList.add(date);
                    subjectList.add(subject);
                    weekList.add(week);
                    contentList.add(content);
                }
            }

            SubjectInfoList subjectInfoList = new SubjectInfoList();
            subjectInfoList.setDate(dateList);
            subjectInfoList.setSubject(subjectList);
            subjectInfoList.setWeek(weekList);
            subjectInfoList.setContent(contentList);

            return subjectInfoList;
        } catch(Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    private List<String> getStyleInfo(String nickname){
        List<Style> styleList = styleRepository.findByNickname(nickname);
        if(styleList.isEmpty()) return null;

        Style style = styleList.get(0);
        StringBuilder sb = new StringBuilder();

        sb.append("하루에 공부할 과목의 수: ").append(style.getStudySubject()).append("\n");
        sb.append("하루에 총 공부 시간: ").append(style.getStudyTime()).append("\n");
        sb.append("학습 방식: ").append(style.getStudyStyle()).append("\n");

        List<String> result = new ArrayList<>();
        result.add(sb.toString());
        result.add(style.getStudySubject());

        return result;
    }

    private String buildPrompt(Map<String, Object> body){
        List<Map<String, String>> subjectInfo = (List<Map<String, String>>)body.get("subjectInfo");
        List<String> existingSubjectNames = (List<String>)body.get("existingSubjectList");
        String nickname = (String)body.get("nickname");
        String startDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String endDate = (String)body.get("endDate");
        List<String> subjectNames = (List<String>)body.get("subjects");
        List<String> subjectDates = (List<String>)body.get("subjectDates");

        // 1. 각 subject의 endDate을 가져옴
        // key가 subjectNames, value가 subjectDates

        Map<String, String> subjectEndDateMap = new HashMap<>();
        for(int i = 0; i < subjectNames.size(); i++){
            subjectEndDateMap.put(subjectNames.get(i), subjectDates.get(i));
        }

        subjectEndDateMap.entrySet().removeIf(
                entry -> !existingSubjectNames.contains(entry.getKey())
        );

        StringBuilder endDatesSb = new StringBuilder();
        for(String name : existingSubjectNames){
            endDatesSb.append(name).append("의 시험 종료일은 ").append(subjectEndDateMap.get(name)).append("이야. ");
        }

        // 2. 사용자의 학습 스타일을 가져옴
        // studyTime, studySubject, studyStyle
        List<String> res = getStyleInfo(nickname);
        String style = "";
        String studySubject = "";

        if(res != null){
            style = res.get(0);
            studySubject = res.get(1);
        }

        // 3. 사용자가 입력한 계획 정보를 가져옴
        // subject, week, content, important

        StringBuilder subjectSb = new StringBuilder();
        for(Map<String, String> info : subjectInfo){
            for(String value : info.values()){
                subjectSb.append(value).append(", ");
            }
            subjectSb.append("\n");
        }

        System.out.println("텍스트 길이 (char 수): " + subjectSb.length());

        StringBuilder sb = new StringBuilder();

        if(!style.equals("")){
            sb.append("너는 똑똑한 AI 공부 도우미야. 요구사항에 따라 학습 계획표를 세워줘.\n");
            sb.append("[요구사항]\n");
            sb.append("❗ 1. 공부 시작일 ").append(startDate).append("일부터 ").append("종료일 ").append(endDate).append("일 중 하나라도 계획이 없는 날이 있어선 안 돼.");
            sb.append("❗ 2. 하루에 여러 과목이 적절히 분배되도록 매일의 계획을 세워줘.");
            sb.append("❗ 3. **출력/응답 시 반드시 (YYYY-MM-DD, 과목 이름, 공부 분량) 이라는 형식을 지켜. 형식을 지키지 않으면 계획표는 저장되지 않아.** **앞뒤로, 혹은 중간에 다른 설명, 요약, 문장은 절대 포함 시키지마.**");
            sb.append("❗ 4. 매일의 계획에 날짜를 빠뜨리지마. 날짜가 없는 응답은 무조건 잘못된 출력이야.");
            sb.append("❗ 5. ").append(endDatesSb.toString()).append(" 참고하여 계획을 짤 때 반드시 시험 종료일 전까지의 계획만 짜줘. ");
            sb.append("예를 들어 과목 AI융합개론의 시험 종료일이 2025-07-31일이고, 클라우딩컴퓨팅AI의 시험 종료일이 2025-08-03일이면, 2025-07-30일 이후 계획에 AI융합개론 공부 분량이 포함되면 안 돼. 마찬가지로, 2025-08-02일 이후에 클라우딩컴퓨팅AI 공부 분량이 포함되면 안 돼.");
            sb.append("❗ 6. 계획을 짤 때는 사용자의 학습 정보 또한 고려해야 해. ").append(style);
            sb.append("❗ 중요! **반드시 각 날짜 별로 공부하는 과목을 ").append(studySubject).append("개로 맞춰서 계획표를 생성해줘. ").append(studySubject).append("는 사용자의 하루 학습할 과목의 수야. 이 기준에 반드시 맞춰.**");

            sb.append("[계획표 예시]").append("\n");
            sb.append("2025-07-18, AI융합개론, 1주, 강의 개요\n");
            sb.append("2025-07-18, 고급파이썬프로그래밍, 1주, 수업 개요 & 파이썬 설치 및 사용법\n");
            sb.append("2025-07-19, AI융합개론, 2주, 지능의 예시와 정의\n");
            sb.append("2025-07-19, 고급파이썬프로그래밍, 2주, 파이썬 개념 리뷰 - 명령어 & 집합, 리 스트, 튜플, 딕셔너리 - 프로그램 흐름제어\n");

            sb.append("[계획표 생성에 필요한 정보]").append("\n");
            sb.append("여러 줄의 (학습 해야 하는 과목명, 주차명, 공부 분량/내용, 중요 여부)로 구성돼 있어. 반드시 이 정보를 바탕으로 계획을 세워줘.").append("\n");
            sb.append("❗ 단, **각 줄에서 중요 여부에 해당하는 마지막 값이 true일 경우 반드시 공부 분량을 이틀로 잡아야 해.** ").append("\n");
            sb.append("예를 들어서 (클라우딩컴퓨팅AI, 1주/1회차, 클라우딩 컴퓨팅이란, true)이 있으면, 중요 여부가 false 일 때 2025-08-01일에 생성하려고 했다면, true일 때는 2025-08-01일, 2025-08-02일처럼 이틀에 걸쳐서 계획표에 들어가야 해.");
            sb.append(subjectSb.toString());
            sb.append("❗ 주의: 다시 한 번 말하지만, **출력/응답 시 반드시 (YYYY-MM-DD, 과목 이름, 공부 분량) 이라는 형식을 지켜. 형식을 지키지 않으면 계획표는 저장되지 않아.** **앞뒤로, 혹은 중간에 다른 설명, 요약, 문장은 절대 포함 시키지마.**");
        } else {
            sb.append("너는 똑똑한 AI 공부 도우미야. 요구사항에 따라 학습 계획표를 세워줘.\n");
            sb.append("[요구사항]\n");
            sb.append("❗ 1. 공부 시작일 ").append(startDate).append("일부터 ").append("종료일 ").append(endDate).append("일 중 하나라도 계획이 없는 날이 있어선 안 돼.");
            sb.append("❗ 2. 하루에 여러 과목이 적절히 분배되도록 매일의 계획을 세워줘.");
            sb.append("❗ 3. **출력/응답 시 반드시 (YYYY-MM-DD, 과목 이름, 공부 분량) 이라는 형식을 지켜. 형식을 지키지 않으면 계획표는 저장되지 않아.** **앞뒤로, 혹은 중간에 다른 설명, 요약, 문장은 절대 포함 시키지마.**");
            sb.append("❗ 4. 매일의 계획에 날짜를 빠뜨리지마. 날짜가 없는 응답은 무조건 잘못된 출력이야.");
            sb.append("❗ 5. ").append(endDatesSb.toString()).append(" 참고하여 계획을 짤 때 반드시 시험 종료일 전까지의 계획만 짜줘. ");
            sb.append("예를 들어 과목 AI융합개론의 시험 종료일이 2025-07-31일이고, 클라우딩컴퓨팅AI의 시험 종료일이 2025-08-03일이면, 2025-07-30일 이후 계획에 AI융합개론 공부 분량이 포함되면 안 돼. 마찬가지로, 2025-08-02일 이후에 클라우딩컴퓨팅AI 공부 분량이 포함되면 안 돼.");

            sb.append("[계획표 예시]").append("\n");
            sb.append("2025-07-18, AI융합개론, 1주, 강의 개요\n");
            sb.append("2025-07-18, 고급파이썬프로그래밍, 1주, 수업 개요 & 파이썬 설치 및 사용법\n");
            sb.append("2025-07-19, AI융합개론, 2주, 지능의 예시와 정의\n");
            sb.append("2025-07-19, 고급파이썬프로그래밍, 2주, 파이썬 개념 리뷰 - 명령어 & 집합, 리 스트, 튜플, 딕셔너리 - 프로그램 흐름제어\n");

            sb.append("[계획표 생성에 필요한 정보]").append("\n");
            sb.append("여러 줄의 (학습 해야 하는 과목명, 주차명, 공부 분량/내용, 중요 여부)로 구성돼 있어. 반드시 이 정보를 바탕으로 계획을 세워줘.").append("\n");
            sb.append("❗ 단, **각 줄에서 중요 여부에 해당하는 마지막 값이 true일 경우 반드시 공부 분량을 이틀로 잡아야 해.** ").append("\n");
            sb.append("예를 들어서 (클라우딩컴퓨팅AI, 1주/1회차, 클라우딩 컴퓨팅이란, true)이 있으면, 중요 여부가 false 일 때 2025-08-01일에 생성하려고 했다면, true일 때는 2025-08-01일, 2025-08-02일처럼 이틀에 걸쳐서 계획표에 들어가야 해.");
            sb.append(subjectSb.toString());
            sb.append("❗ 주의: 다시 한 번 말하지만, **출력/응답 시 반드시 (YYYY-MM-DD, 과목 이름, 공부 분량) 이라는 형식을 지켜. 형식을 지키지 않으면 계획표는 저장되지 않아.** **앞뒤로, 혹은 중간에 다른 설명, 요약, 문장은 절대 포함 시키지마.**");
        }

        return sb.toString();
    }

    public String getChatInput(Map<String, String> body) throws IOException, InterruptedException {
        String content = body.get("content");
        String chatInput = body.get("chatInput");
        ai.setDefaultPrompt("너는 학생들의 공부를 도와주는 수룡이 챗봇이야. 친근한 말투로 학생들을 도와줘야 해.\n\n" + content + "\n\n이 배경 지식을 바탕으로 다음의 물음에 답해줘:\n");
        String result = ai.requestAnswer(chatInput).getResponse();
        return result.replace("**", "");
    }

    /**
     * GPT에게 퀴즈 프롬프트 전달하고 퀴즈 리스트 반환
     * @param prompt GPT에 보낼 프롬프트 (퀴즈 생성 명령 포함)
     * @return 퀴즈 리스트 (문자열 리스트 형태)
     */
    public List<String> useQuizAi(String prompt) {
        try {
            Response responseObj = ai.requestAnswer(prompt);

            if (responseObj == null || responseObj.getResponse() == null) {
                throw new RuntimeException("failed to receive response from ChatGPT");
            }

            String response = responseObj.getResponse();
            System.out.println("response = " + response);

            // 줄바꿈 기준으로 문제 분리해서 리스트로 반환
            return Arrays.stream(
                            response.split("(?<=@@[^@]+@@[^@]+)(?=\\s*[^@\\s])|\\n") // @@정답@@다음에 문제시작 또는 줄바꿈
                    )
                    .map(String::trim)
                    .filter(line -> !line.isEmpty())
                    .toList();

        } catch (Exception e) {
            throw new RuntimeException("failed to receive response from ChatGPT" + e.getMessage());
        }
    }

    public boolean useQuizScoreAi(Quiz quiz, String userAnswer){
        StringBuilder sb = new StringBuilder();

        sb.append("[ 질문 ]\n");
        sb.append(quiz.getQuestion()).append("\n");
        sb.append("[ 실제 정답 ]\n");
        sb.append(quiz.getAnswer()).append("\n");
        sb.append("[ 사용자가 낸 정답 ]\n");
        sb.append(userAnswer).append("\n");
        sb.append("질문에 대한 사용자가 낸 정답이 옳은지 혹은 옳지 않은지를 논리적으로 따져서, 옳으면 O, 옳지 않으면 X로 응답해 줘").append("\n");
        sb.append("사용자가 낸 정답이 실제 정답과 가까우면 가까울수록 실제 정답일 확률은 올라가.").append("\n");
        sb.append("** 다른 말은 덧붙이지 말고 한 단어 O 또는 X 로만 응답할 것. **");
        sb.append("** 해설, 해답 등은 필요 없음. **");

        try{
            Response responseObj = ai.requestAnswer(sb.toString());
            if(responseObj == null || responseObj.getResponse() == null){
                throw new RuntimeException("failed to receive response from ChatGPT");
            }

            String response = responseObj.getResponse();
            System.out.println(response);

            if(response.equals("O")) return true;
            else if(response.equals("X")) return false;
            else throw new RuntimeException("not valid response from ChatGPT"); // 에러 터짐
        } catch(Exception e){
            throw new RuntimeException("failed to receive response from ChatGPT");
        }
    }
}
