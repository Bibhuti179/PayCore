package com.paycore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class PayCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayCoreApplication.class, args);
    }
}
