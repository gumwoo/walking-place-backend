const { Breed, Term } = require('../src/models');
const logger = require('../src/config/logger');
const fs = require('fs');
const path = require('path');

/**
 * 필수 데이터 생성 (견종 + 약관)
 */
async function seedData() {
  try {
    logger.info('필수 데이터 생성 시작');

    // 1. 실제 크롤링된 견종 데이터 사용
    console.log('📖 크롤링된 견종 데이터 로딩 중...');
    
    const breedJsonPath = path.join(__dirname, '../src/dog-breed-crawler/korean_dog_breeds.json');
    
    if (!fs.existsSync(breedJsonPath)) {
      console.error('❌ 견종 데이터 파일을 찾을 수 없습니다:', breedJsonPath);
      console.log('💡 먼저 견종 크롤링을 실행해주세요: node src/dog-breed-crawler/crawler_korean.js');
      return;
    }

    const breedData = JSON.parse(fs.readFileSync(breedJsonPath, 'utf8'));
    console.log(`✅ 총 ${breedData.total_breeds}개의 견종 데이터 로딩 완료`);

    // 견종 데이터 삽입
    let insertedCount = 0;
    let skippedCount = 0;

    for (const breedName of breedData.all_breeds) {
      try {
        const [breed, created] = await Breed.findOrCreate({
          where: { name: breedName },
          defaults: {
            name: breedName,
            icon_url: `https://example.com/breeds/${encodeURIComponent(breedName.toLowerCase())}.png`
          }
        });

        if (created) {
          insertedCount++;
          console.log(`  ✓ ${breedName}`);
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`  ❌ ${breedName} 삽입 실패:`, error.message);
      }
    }

    console.log(`\n📊 견종 데이터 처리 결과:`);
    console.log(`  - 새로 추가: ${insertedCount}개`);
    console.log(`  - 이미 존재: ${skippedCount}개`);

    // 2. 필수 약관 데이터 (법적으로 필요)
    console.log('\n📋 약관 데이터 생성 중...');
    
    const terms = [
      {
        title: '서비스 이용약관',
        content: `제1조 (목적)
본 약관은 산책명소 앱(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 반려동물 산책 관련 모바일 애플리케이션 및 관련 서비스를 의미합니다.
2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.

제3조 (서비스의 제공)
회사는 다음과 같은 서비스를 제공합니다:
- 반려동물 산책로 추천 서비스
- 산책 기록 관리 서비스
- 마킹 포토존 서비스`,
        is_required: true,
        version: '1.0'
      },
      {
        title: '개인정보 처리방침',
        content: `개인정보보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.

제1조 (개인정보의 처리목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다:
- 회원 가입 및 관리
- 서비스 제공에 관한 계약 이행
- 마케팅 및 광고에의 활용

제2조 (개인정보의 처리 및 보유기간)
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.`,
        is_required: true,
        version: '1.0'
      },
      {
        title: '위치정보 이용약관',
        content: `위치정보의 보호 및 이용 등에 관한 법률 제16조에 따라 위치정보 이용에 관한 사항을 다음과 같이 정합니다.

제1조 (위치정보의 수집 및 이용목적)
회사는 다음의 목적으로 개인위치정보를 수집 및 이용합니다:
- 주변 산책로 및 반려동물 관련 시설 정보 제공
- 산책 경로 기록 및 분석
- 위치 기반 맞춤형 서비스 제공

제2조 (개인위치정보의 수집방법)
회사는 이용자의 동의를 받아 GPS칩 등의 위치측정기술이 탑재된 이용자의 휴대폰을 통해 개인위치정보를 수집합니다.

제3조 (개인위치정보의 보유기간)
개인위치정보는 수집 목적 달성 후 즉시 파기합니다. 단, 산책 기록은 이용자가 삭제 요청하기 전까지 보관됩니다.`,
        is_required: true,
        version: '1.0'
      },
      {
        title: '마케팅 정보 수신 동의',
        content: `서비스 관련 혜택 및 이벤트 정보, 신규 서비스 안내 등을 받아보실 수 있습니다.

수신 방법:
- 앱 푸시 알림
- 이메일
- SMS

수신거부:
마케팅 정보 수신을 원하지 않으실 경우 언제든지 앱 설정에서 수신을 거부하실 수 있습니다.

※ 본 동의는 선택사항이며, 동의하지 않아도 서비스 이용에는 제한이 없습니다.`,
        is_required: false,
        version: '1.0'
      }
    ];

    let termInserted = 0;
    let termSkipped = 0;

    for (const termData of terms) {
      const [term, created] = await Term.findOrCreate({
        where: { title: termData.title },
        defaults: termData
      });

      if (created) {
        termInserted++;
        console.log(`  ✓ ${termData.title}`);
      } else {
        termSkipped++;
      }
    }

    console.log(`\n📊 약관 데이터 처리 결과:`);
    console.log(`  - 새로 추가: ${termInserted}개`);
    console.log(`  - 이미 존재: ${termSkipped}개`);

    logger.info('필수 데이터 생성 완료');
    console.log('\n✅ 필수 데이터가 성공적으로 생성되었습니다!');
    console.log(`   📚 견종: ${insertedCount}개 (신규)`);
    console.log(`   📋 약관: ${termInserted}개 (신규)`);
    console.log('\n💡 위치 데이터는 사용자 검색 시 동적으로 생성됩니다.');

  } catch (error) {
    logger.error('필수 데이터 생성 실패:', error);
    console.error('❌ 필수 데이터 생성 실패:', error.message);
    throw error;
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  seedData().then(() => {
    console.log('\n🎉 데이터 초기화 완료! 이제 API 테스트를 진행할 수 있습니다.');
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seedData };
