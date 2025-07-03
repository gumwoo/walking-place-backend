/**
 * 포토존 관련 응답 데이터 포맷터
 * 프론트엔드에서 사용하기 쉬운 형태로 데이터 변환
 */

class PhotoZoneFormatter {

  /**
   * 포토존 데이터를 프론트엔드 친화적으로 포맷
   * @param {Object} photozone - 포토존 원본 데이터
   * @returns {Object} 포맷된 포토존 데이터
   */
  static formatPhotoZone(photozone) {
    const data = photozone.toJSON ? photozone.toJSON() : photozone;
    
    return {
      id: data.id,
      name: data.name,
      
      // 위치 정보를 프론트엔드에서 사용하기 쉬운 형태로
      location: {
        latitude: data.location?.coordinates?.[1] || null,
        longitude: data.location?.coordinates?.[0] || null,
        type: data.location?.type || 'Point'
      },
      
      // 거리 정보 (소수점 1자리)
      distance: data.distance ? Math.round(data.distance * 10) / 10 : null,
      distanceUnit: 'm',
      
      // 감지 반경
      detectionRadius: data.detection_radius,
      detectionRadiusUnit: 'm',
      
      // 코스 정보 (간소화)
      course: data.course ? {
        id: data.course.id,
        title: data.course.title,
        thumbnailImage: data.course.thumbnail_image,
        tailScore: data.course.average_tail_score
      } : null,
      
      // 미리보기 사진들 (최대 3개)
      previewPhotos: data.photos ? data.photos.map(photo => ({
        id: photo.id,
        url: photo.file_url,
        uploadedAt: photo.created_at,
        uploader: photo.user ? {
          dogName: photo.user.dog_name,
          dogBreed: photo.user.dog_breed
        } : null
      })) : [],
      
      createdAt: data.created_at
    };
  }

  /**
   * 포토존 목록을 포맷
   * @param {Array} photozones - 포토존 배열
   * @param {Object} userLocation - 사용자 위치
   * @returns {Object} 포맷된 응답 데이터
   */
  static formatNearbyPhotoZones(photozones, userLocation) {
    return {
      userLocation: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        searchRadius: userLocation.searchRadius,
        searchRadiusUnit: 'm'
      },
      
      photozones: photozones.map(zone => this.formatPhotoZone(zone)),
      
      summary: {
        totalCount: photozones.length,
        hasResults: photozones.length > 0,
        searchTime: new Date().toISOString()
      }
    };
  }

  /**
   * 포토존 사진을 포맷
   * @param {Object} photo - 사진 원본 데이터
   * @returns {Object} 포맷된 사진 데이터
   */
  static formatPhotoZonePhoto(photo) {
    const data = photo.toJSON ? photo.toJSON() : photo;
    
    return {
      id: data.id,
      url: data.file_url,
      uploadedAt: data.created_at,
      
      // 업로더 정보
      uploader: data.user ? {
        id: data.user.id,
        dogName: data.user.dog_name,
        dogBreed: data.user.dog_breed,
        dogSize: data.user.dog_size
      } : null,
      
      // 포토존 정보 (간소화)
      photozone: data.photozone || data.markingPhotozone ? {
        id: (data.photozone || data.markingPhotozone).id,
        name: (data.photozone || data.markingPhotozone).name
      } : null
    };
  }

  /**
   * 포토존 사진 목록과 페이지네이션을 포맷
   * @param {Object} result - 서비스에서 반환된 결과
   * @returns {Object} 포맷된 응답 데이터
   */
  static formatPhotoZonePhotos(result) {
    return {
      photozone: {
        id: result.photozone.id,
        name: result.photozone.name,
        course: result.photozone.course ? {
          id: result.photozone.course.id,
          title: result.photozone.course.title,
          isActive: result.photozone.course.is_active
        } : null
      },
      
      photos: result.photos.map(photo => this.formatPhotoZonePhoto(photo)),
      
      pagination: {
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalItems: result.pagination.totalItems,
        itemsPerPage: result.pagination.itemsPerPage,
        hasNext: result.pagination.hasNext,
        hasPrev: result.pagination.hasPrev
      }
    };
  }

  /**
   * 업로드된 사진 정보를 포맷
   * @param {Object} uploadedPhoto - 업로드된 사진 데이터
   * @returns {Object} 포맷된 업로드 결과
   */
  static formatUploadedPhoto(uploadedPhoto) {
    const formatted = this.formatPhotoZonePhoto(uploadedPhoto);
    
    return {
      ...formatted,
      
      // 업로드 성공 정보 추가
      uploadSuccess: true,
      uploadedAt: formatted.uploadedAt,
      
      // 파일 정보
      fileInfo: {
        url: formatted.url,
        size: uploadedPhoto.size || null,
        type: uploadedPhoto.mimetype || null
      }
    };
  }
}

module.exports = PhotoZoneFormatter;
