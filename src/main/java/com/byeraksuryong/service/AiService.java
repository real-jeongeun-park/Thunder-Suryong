package com.byeraksuryong.service;

import com.byeraksuryong.api.AiApi;
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
        List<Map<String, String>> subjectInfo = (List<Map<String, String>>)body.get("subjectInfo");
        String nickname = (String)body.get("nickname");
        String startDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String endDate = (String)body.get("endDate");
        String request;

        // 존재하는 subject names
        Set<String> existingSubjectNamesSet = new HashSet<>();
        for(Map<String, String> element : subjectInfo){
            String subject = element.get("subject");
            existingSubjectNamesSet.add(subject);
        }

        List<String> existingSubjectNames = new ArrayList<>(existingSubjectNamesSet);

        List<String> subjectNames = (List<String>)body.get("subjects");
        List<String> subjectDates = (List<String>)body.get("subjectDates");

        // key가 subjectNames, value가 subjectDates
        Map<String, String> subjectMap = new HashMap<>();
        for(int i = 0; i < subjectNames.size(); i++){
            subjectMap.put(subjectNames.get(i), subjectDates.get(i));
        }

        Map<String, String> styleInfo = getStyleInfo(nickname); // 스타일 가져옴. studyTime, studySubject, studystyle

        StringBuilder stringBuilder = new StringBuilder();
        for(Map<String, String> info : subjectInfo){
            for(String value : info.values()){
                stringBuilder.append(value + " ");
            }
            stringBuilder.append("\n");
        }

        String chunkText;
        String fullText = stringBuilder.toString();
        int length = fullText.length();
        int chunkSize = 1000; // 한 번에 1000자까지만 ok

        StringBuilder chunkedTextBuilder = new StringBuilder();
        for(int i = 0; i < length; i += chunkSize){
            chunkText = fullText.substring(i, Math.min(length, i + chunkSize));
            chunkedTextBuilder.append("이어서 계속:\n").append(chunkText).append("\n");
        }

        System.out.println("텍스트 길이 (char 수): " + chunkedTextBuilder.length());

        StringBuilder endDates = new StringBuilder();
        for(int i = 0; i < existingSubjectNames.size(); i++){
            String name = existingSubjectNames.get(i);
            endDates.append(name + "의 종료일: ");
            endDates.append(subjectMap.get(name) + "\n");
        }

        System.out.println(endDates.toString());

        if(styleInfo != null && !styleInfo.isEmpty()){
            request = "너는 똑똑한 AI 공부 도우미야. 아래를 모두 고려하여 **학습 플래너, 계획표**를 세워줘.\n" +
                    "[요구사항]\n" +
                    "1. 공부 시작일부터 종료일까지 **하루도 빠짐없이** 계획표에 포함시켜.\n" +
                    "2. 하루에 여러 과목이 적절히 분배되도록 구성해줘.\n" +
                    "3. 출력은 꼭 아래 형식만 써야 해. **앞 뒤로, 혹은 중간에 다른 설명, 요약, 문장 없이** 형식대로만 출력해.\n" +
                    "4. **날짜를 빠뜨려선 안 돼. 날짜가 없는 응답은 잘못된 응답이야.** 날짜는 YYYY-MM-DD 형태로 매 줄의 항상 가장 앞에 위치해. \n" +
                    "5. **다음은 각 과목의 시험 종료일이야. 계획을 짤 때, 각 과목에 대해 종료일 이후의 계획은 있으면 안 돼. 예를 들어 AI융합개론의 종료일이 2025-07-31이면, 2025-07-31 이후의 계획에 AI융합개론 과목과 주차는 포함되면 안 돼.**\n" +
                    endDates.toString() +
                    "\n" +
                    "[계획표 예시]\n" +
                    "2025-07-18, AI융합개론, 1주, 강의 개요\n" +
                    "2025-07-18, 고급파이썬프로그래밍, 1주, 수업 개요 & 파이썬 설치 및 사용법\n" +
                    "2025-07-19, AI융합개론, 2주, 지능의 예시와 정의\n" +
                    "2025-07-19, 고급파이썬프로그래밍, 2주, 파이썬 개념 리뷰 - 명령어 & 집합, 리 스트, 튜플, 딕셔너리 - 프로그램 흐름제어\n" +
                    "\n" +
                    "[계획표에 대한 정보]\n" +
                    "- 공부 시작일: " + startDate + "\n" +
                    "- 공부 종료일: " + endDate + "\n" +
                    "- 하루에 공부할 과목 수: " + styleInfo.get("studySubject") + "\n" +
                    "- 하루 총 공부 시간: " + styleInfo.get("studyTime") + "\n" +
                    "- 학습 스타일: " + styleInfo.get("studyStyle") + "\n" +
                    "- 학습할 각 과목 명, 주차 명, 분량/내용: " + chunkedTextBuilder.toString() + "\n\n";
        } else {
            // 스타일 정보가 없음
            request = "너는 똑똑한 AI 공부 도우미야. 아래를 모두 고려하여 **학습 플래너, 계획표**를 세워줘.\n" +
                    "[요구사항]\n" +
                    "1. 공부 시작일부터 종료일까지 **하루도 빠짐없이** 계획표에 포함시켜.\n" +
                    "2. 하루에 여러 과목이 적절히 분배되도록 구성해줘.\n" +
                    "3. 출력은 꼭 아래 형식만 써야 해. **앞 뒤로, 혹은 중간에 다른 설명, 요약, 문장 없이** 형식대로만 출력해.\n" +
                    "4. **날짜를 빠뜨려선 안 돼. 날짜가 없는 응답은 잘못된 응답이야.** 날짜는 YYYY-MM-DD 형태로 매 줄의 항상 가장 앞에 위치해. \n" +
                    "5. **다음은 각 과목의 시험 종료일이야. 계획을 짤 때, 각 과목에 대해 종료일 이후의 계획은 있으면 안 돼. 예를 들어 AI융합개론의 종료일이 2025-07-31이면, 2025-07-31 이후의 계획에 AI융합개론 과목과 주차는 포함되면 안 돼.**\n" +
                    endDates.toString() +
                    "\n" +
                    "[계획표 예시]\n" +
                    "2025-07-18, AI융합개론, 1주, 강의 개요\n" +
                    "2025-07-18, 고급파이썬프로그래밍, 1주, 수업 개요 & 파이썬 설치 및 사용법\n" +
                    "2025-07-19, AI융합개론, 2주, 지능의 예시와 정의\n" +
                    "2025-07-19, 고급파이썬프로그래밍, 2주, 파이썬 개념 리뷰 - 명령어 & 집합, 리스트, 튜플, 딕셔너리 - 프로그램 흐름제어\n" +
                    "\n" +
                    "[계획표에 대한 정보]\n" +
                    "- 공부 시작일: " + startDate + "\n" +
                    "- 공부 종료일: " + endDate + "\n" +
                    "- 학습할 각 과목 명, 주차 명, 분량/내용: " + chunkedTextBuilder.toString() + "\n\n";
        }

        try{
            String response = ai.requestAnswer(request).getResponse();

            List<String> resultList = Arrays.stream(response.split("\n"))
                    .map(String::trim)
                    .toList();

            List<String> dateList = new ArrayList<>();
            List<String> subjectList = new ArrayList<>();
            List<String> weekList = new ArrayList<>();
            List<String> contentList = new ArrayList<>();

            for(String element : resultList){
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

    public Map<String, String> getStyleInfo(String nickname){
        List<Style> styleList = styleRepository.findByNickname(nickname);
        if(styleList == null || styleList.isEmpty()) return null;

        Style style = styleList.get(0);

        Map<String, String> styleInfo = new HashMap<>();
        styleInfo.put("studyTime", style.getStudyTime());
        styleInfo.put("studySubject", style.getStudySubject());
        styleInfo.put("studyStyle", style.getStudyStyle());

        return styleInfo;
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
                System.out.println("GPT 응답이 null입니다. 퀴즈 생성 실패");
                return new ArrayList<>();  // 빈 리스트로 반환
            }

            String response = responseObj.getResponse();

            // 줄바꿈 기준으로 문제 분리해서 리스트로 반환
            return Arrays.stream(
                            response.split("(?<=@@[^@]+@@[^@]+)(?=\\s*[^@\\s])|\\n") // @@정답@@다음에 문제시작 또는 줄바꿈
                    )
                    .map(String::trim)
                    .filter(line -> !line.isEmpty())
                    .toList();

        } catch (Exception e) {
            System.out.println("GPT 호출 중 오류: " + e.getMessage());
            return new ArrayList<>();  // 예외 발생 시도 빈 리스트 반환
        }
    }
}
