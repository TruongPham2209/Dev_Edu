package com.pht.dev_edu.common.generator;

import com.github.f4b6a3.uuid.UuidCreator;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

/**
 * Custom Hibernate {@link IdentifierGenerator} that generates time-ordered UUIDv7 identifiers.
 * Uses {@link UuidCreator#getTimeOrderedEpoch()} to generate sequential UUIDs optimized for database B-tree indexing.
 */
public class UuidV7Generator implements IdentifierGenerator {

    /**
     * Generates a new UUIDv7 identifier for the target entity.
     *
     * @param session the current Hibernate session implementor.
     * @param object  the entity instance for which the identifier is being generated.
     * @return a time-ordered epoch UUID (UUIDv7).
     */
    @Override
    public Object generate(SharedSessionContractImplementor session, Object object) {
        return UuidCreator.getTimeOrderedEpoch();
    }
}
