package com.ada.ratemycourse.controller;

import com.ada.ratemycourse.dto.CourseResponse;
import com.ada.ratemycourse.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{code}")
    public ResponseEntity<CourseResponse> getCourseByCode(@PathVariable String code) {
        return ResponseEntity.ok(courseService.getCourseByCode(code));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseResponse>> searchCourses(@RequestParam String query) {
        return ResponseEntity.ok(courseService.searchCourses(query));
    }

    @GetMapping("/school/{school}")
    public ResponseEntity<List<CourseResponse>> getCoursesBySchool(@PathVariable String school) {
        return ResponseEntity.ok(courseService.getCoursesBySchool(school));
    }
}