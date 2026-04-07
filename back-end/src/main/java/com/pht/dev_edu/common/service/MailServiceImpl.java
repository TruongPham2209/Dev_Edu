package com.pht.dev_edu.common.service;

import brevo.ApiException;
import brevoApi.TransactionalEmailsApi;
import brevoModel.CreateSmtpEmail;
import brevoModel.SendSmtpEmail;
import brevoModel.SendSmtpEmailAttachment;
import brevoModel.SendSmtpEmailSender;
import com.lowagie.text.pdf.BaseFont;
import com.pht.dev_edu.common.dto.MailPayload;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextFontResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class MailServiceImpl implements MailService {
    TransactionalEmailsApi emailsApi;
    SendSmtpEmailSender sender;
    TemplateEngine templateEngine;

    @Override
    public void sendMail(MailPayload mailPayload) {
        String subject = mailPayload.getSubject();
        String templateName = mailPayload.getTemplate();
        SendSmtpEmailAttachment attachment = null;  // Use Brevo attachment class

        String htmlContent = getHtmlTemplate(mailPayload.getMailAttributes(), templateName);
        if (mailPayload.getFileAttributes() != null && !mailPayload.getFileAttributes().isEmpty()) {

            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                ITextRenderer renderer = new ITextRenderer();
                ITextFontResolver fontResolver = renderer.getFontResolver();

                String fontPath = Objects.requireNonNull(
                        getClass().getResource("/fonts/arial-unicode-ms.ttf")
                ).toExternalForm();
                fontResolver.addFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

                renderer.setDocumentFromString(htmlContent);
                renderer.layout();
                renderer.createPDF(outputStream);
                renderer.finishPDF();

                String pdfFileName = mailPayload.getFileAttributes().get("fileName") + ".pdf";

                byte[] pdfBytes = outputStream.toByteArray();
                attachment = new SendSmtpEmailAttachment();
                attachment.setContent(pdfBytes);
                attachment.setName(pdfFileName);
            } catch (Exception e) {
                log.error("Error creating PDF attachment", e);
            }
        }

        sendMailWithBrevo(subject, htmlContent, mailPayload.getToMail(), true,
                attachment != null ? List.of(attachment) : null
        );
    }

    private void sendMailWithBrevo(String subject, String body, String toMail, boolean isHtml, List<SendSmtpEmailAttachment> attachments) {
        try {
            SendSmtpEmail email = new SendSmtpEmail();
            email.setSender(sender);
            email.setSubject(subject);
            email.setTo(
                    java.util.Collections.singletonList(
                            new brevoModel.SendSmtpEmailTo().email(toMail)
                    )
            );

            if (isHtml) {
                email.setHtmlContent(body);
            } else {
                email.setTextContent(body);
            }

            if (attachments != null && !attachments.isEmpty()) {
                email.setAttachment(attachments);
            }

            CreateSmtpEmail response = emailsApi.sendTransacEmail(email);
            log.info("Brevo response: {}", response);
        } catch (ApiException e) {
            log.error("Brevo API error: {}", e.getResponseBody(), e);
            log.error("Error sending mail via Brevo Mail", e);
        }
    }

    private String getHtmlTemplate(Map<String, Object> variables, String templateName) {
        Context context = new Context();
        if (variables != null) {
            log.info("Variables: {}", variables);
            Map<String, Object> safeMap = new HashMap<>();
            variables.forEach((k, v) -> safeMap.put(String.valueOf(k), v));
            context.setVariables(safeMap);
        }

        return templateEngine.process(templateName, context);
    }
}
