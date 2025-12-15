package com.ada.ratemycourse.dto;

import jdk.jshell.Snippet;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data

public class ProfessorResponse {
    private Long id;
    private String name;
    private String school;
    private String department;
    private Integer coursesCount;
    private Double averageRating;
    private Integer reviewCount;
    private String difficulty;
    private List<CourseResponse> courses;

}