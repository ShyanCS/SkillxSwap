package com.skillswap.backend.common.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    /**
     * The visible sender.
     *
     * Set explicitly rather than left to Spring's default, which falls back to
     * the SMTP username. With a relay like Brevo or SES that username is an
     * internal credential (e.g. 8a1b2c@smtp-brevo.com), not a verified sender,
     * so the provider rejects the message or it lands in spam.
     */
    private final String fromAddress;

    private final String fromName;

    public MailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromAddress,
            @Value("${app.mail.from-name}") String fromName) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    /** RFC 5322 "Display Name <address>" so inboxes show a name, not a bare address. */
    private SimpleMailMessage compose(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromName == null || fromName.isBlank() ? fromAddress : fromName + " <" + fromAddress + ">");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        return message;
    }

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
            mailSender.send(compose(to, subject, text));
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
        mailSender.send(compose(to, subject, text));
    }
}
