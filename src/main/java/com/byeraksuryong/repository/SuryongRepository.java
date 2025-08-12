package com.byeraksuryong.repository;

public interface SuryongRepository {

    // 종/버킷에 맞는 assetKey 랜덤 1개 반환 (없으면 null)
    String getRandomAssetKey(String speciesCode, Integer bucket);
}

