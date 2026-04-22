package com.pht.dev_edu.forum.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.forum.repo.CommentRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component("forumCommentScheduler")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentScheduler {
    CommentRepository commentRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 7;

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedComments() {
        var cutoffTime = java.time.LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_FORUM_COMMENTS_JOB,
                () -> commentRepository
                        .deleteByDeletedAtIsBefore(cutoffTime),
                "Deleted %d comments that were marked for deletion"
        );
    }

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanCommentsWithoutReference() {
        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_FORUM_COMMENTS_JOB,
                () -> {
                    var deletedIds = commentRepository.deleteCommentWithoutPostReference();
                    return deletedIds.size();
                },
                "Deleted %d comments that were marked for deletion and have no reference to any post"
        );
    }
}
