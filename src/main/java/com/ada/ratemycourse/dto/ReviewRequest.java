package com.ada.ratemycourse.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Double rating;

    @NotBlank
    @Pattern(regexp = "Easy|Moderate|Hard")
    private String difficulty;

    @NotBlank
    @Size(min = 10, max = 2000)
    private String text;

    @NotBlank
    @Pattern(regexp = "Fall|Spring|Summer")
    private String semester;

    @NotNull
    @Min(2015)
    @Max(2030)
    private Integer year;

    private Long courseId;
    private Long professorId;
}