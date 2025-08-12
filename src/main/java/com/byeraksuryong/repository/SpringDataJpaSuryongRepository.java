package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Suryong;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataJpaSuryongRepository
        extends JpaRepository<Suryong, Long>, SuryongRepository {

    @Query("""
        SELECT s.assetKey FROM Suryong s
        WHERE s.speciesCode = :species AND s.bucket = :bucket
        ORDER BY function('RAND')
    """)
    List<String> _findRandomAssetKey(@Param("species") String species,
                                     @Param("bucket") Integer bucket,
                                     org.springframework.data.domain.Pageable p);

    @Override
    default String getRandomAssetKey(String speciesCode, Integer bucket) {
        var list = _findRandomAssetKey(speciesCode, bucket, PageRequest.of(0, 1));
        return list.isEmpty() ? null : list.get(0);
    }
}
