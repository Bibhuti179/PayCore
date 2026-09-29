package com.paycore.controller;

import com.paycore.dto.*;
import com.paycore.entity.AccountStatus;
import com.paycore.entity.TransactionStatus;
import com.paycore.entity.TransactionType;
import com.paycore.service.AdminService;
import com.paycore.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    public AdminController(AdminService adminService, ReportService reportService) {
        this.adminService = adminService;
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard metrics retrieved", dashboard));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Page<CustomerAdminResponse>>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CustomerAdminResponse> customers = adminService.getCustomers(search, status, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Customer list retrieved", customers));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> getCustomerDetails(@PathVariable Long id) {
        CustomerAdminResponse customer = adminService.getCustomerDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Customer details retrieved", customer));
    }

    @PutMapping("/customers/{id}/approve")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> approveCustomer(@PathVariable Long id) {
        CustomerAdminResponse approvedCustomer = adminService.approveCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer account approved and wallet activated successfully", approvedCustomer));
    }

    @PutMapping("/customers/{id}/reject")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> rejectCustomer(@PathVariable Long id) {
        CustomerAdminResponse rejectedCustomer = adminService.rejectCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer account marked as rejected", rejectedCustomer));
    }

    @PutMapping("/customers/{id}/suspend")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> suspendCustomer(@PathVariable Long id) {
        CustomerAdminResponse suspendedCustomer = adminService.suspendCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer account suspended", suspendedCustomer));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<TransactionAdminResponse>>> getTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) String reference,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionAdminResponse> transactions = adminService.getTransactions(type, status, reference, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Transactions list retrieved", transactions));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<TransactionAdminResponse>> getTransactionDetails(@PathVariable Long id) {
        TransactionAdminResponse txn = adminService.getTransactionDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction details retrieved", txn));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<AdminReportResponse>> getReports() {
        AdminReportResponse report = reportService.generateSystemReports();
        return ResponseEntity.ok(ApiResponse.success("System reports generated", report));
    }
}
