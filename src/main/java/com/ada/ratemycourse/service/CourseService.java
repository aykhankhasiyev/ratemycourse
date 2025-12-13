package com.ada.ratemycourse.service;

import com.ada.ratemycourse.dto.CourseResponse;
import org.jspecify.annotations.Nullable;

import java.util.List;

public interface CourseService {
    @Nullable List<CourseResponse> getAllCourses();

    @Nullable CourseResponse getCourseByCode(String code);

    @Nullable List<CourseResponse> searchCourses(String query);

    @Nullable List<CourseResponse> getCoursesBySchool(String school);
}
