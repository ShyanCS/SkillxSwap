package com.skillswap.backend.report.repository;

import com.skillswap.backend.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByIdDesc();
    long countByStatus(String status);
}
