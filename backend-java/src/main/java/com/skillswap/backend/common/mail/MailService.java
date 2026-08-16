package com.skillswap.backend.common.mail;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    /**
     * Sent on a background executor. SMTP round-trips routinely take hundreds of
     * milliseconds (and can hit the multi-second connect/read timeouts set in
     * application-prod.yml), so sending inline made every notification-producing
     * request -- sending a message, accepting a match -- wait on the mail server.
     *
     * Failures are logged, never rethrown: the caller's transaction has already
     * committed by the time this runs, and a bounced notification email must not
     * look like a failed action to the user.
     */
    @Async("mailExecutor")
    public void send(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Blocking send for flows where delivery is part of the user-visible outcome:
     * the OTP screen tells the member to go check their inbox, so a hard failure
     * there needs to surface as an error rather than a silent dead end.
     */
    public void sendSync(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
