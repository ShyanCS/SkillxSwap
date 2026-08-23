package com.skillswap.backend.report.repository;

import com.skillswap.backend.report.entity.Report;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByIdDesc();

    long countByStatus(String status);
}
