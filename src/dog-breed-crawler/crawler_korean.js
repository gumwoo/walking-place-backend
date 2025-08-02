const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const fs = require('fs');

class DogBreedCrawler {
    constructor() {
        this.baseUrl = 'https://www.thekkf.or.kr/m/03_kkf_service/03_approval_2.php';
        this.dogBreeds = [];
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        };
    }

    async crawlPage(gid) {
        try {
            console.log(`크롤링 중: ${gid}그룹`);
            const url = `${this.baseUrl}?gid=${gid}`;
            
            // 한글 인코딩 처리를 위해 arraybuffer로 받기
            const response = await axios.get(url, { 
                headers: this.headers,
                responseType: 'arraybuffer'
            });
            
            // EUC-KR 인코딩을 UTF-8로 변환
            const html = iconv.decode(response.data, 'euc-kr');
            const $ = cheerio.load(html);
            
            const breeds = [];
            
            // center mt40 클래스를 가진 div들을 찾아서 한글 견종명만 추출
            $('.center.mt40').each((index, element) => {
                const $element = $(element);
                const koreanName = $element.find('p.mt10.inline_block').first().text().trim();
                
                if (koreanName && 
                    koreanName.length > 1 &&
                    !koreanName.includes('그룹') &&
                    !koreanName.includes('PC버전') &&
                    koreanName.match(/[가-힣]/)) { // 한글이 포함된 것만
                    
                    breeds.push({
                        gid: gid,
                        name: koreanName
                    });
                }
            });
            
            console.log(`${gid}그룹에서 ${breeds.length}개 견종 발견`);
            breeds.forEach(breed => {
                console.log(`  - ${breed.name}`);
            });
            
            return breeds;
            
        } catch (error) {
            console.error(`${gid}그룹 크롤링 실패:`, error.message);
            return [];
        }
    }

    async crawlAllPages() {
        console.log('🐕 한국애견연맹 견종 크롤링 시작...\n');
        
        for (let gid = 1; gid <= 10; gid++) {
            const breeds = await this.crawlPage(gid);
            this.dogBreeds.push(...breeds);
            
            // 서버 부하 방지를 위한 딜레이
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        console.log(`\n✅ 총 ${this.dogBreeds.length}개의 견종 정보를 수집완료!`);
    }

    groupBreedsByGroup() {
        const grouped = {};
        for (let i = 1; i <= 10; i++) {
            grouped[i] = this.dogBreeds.filter(breed => breed.gid === i);
        }
        return grouped;
    }

    getGroupName(gid) {
        const groupNames = {
            1: "쉽독, 캐틀독",
            2: "몰로서스독 타입",
            3: "테리어",
            4: "닥스훈트",
            5: "스피츠, 프리미티브 타입",
            6: "센트하운드",
            7: "포인터",
            8: "리트리버, 플러싱독, 워터독",
            9: "컴패니언, 토이독",
            10: "사이트하운드"
        };
        return groupNames[gid] || `${gid}그룹`;
    }

    saveToJson() {
        const filename = 'src/dog-breed-crawler/korean_dog_breeds.json';
        const groupedBreeds = this.groupBreedsByGroup();
        
        const data = {
            source: '한국애견연맹(KKF)',
            source_url: 'https://www.thekkf.or.kr/m/03_kkf_service/03_approval_2.php',
            crawled_date: new Date().toISOString(),
            total_breeds: this.dogBreeds.length,
            groups: {},
            all_breeds: this.dogBreeds.map(breed => breed.name) // 견종명만 배열로
        };
        
        // 그룹별로 정리
        for (let i = 1; i <= 10; i++) {
            data.groups[i] = {
                group_number: i,
                group_name: this.getGroupName(i),
                breed_count: groupedBreeds[i].length,
                breeds: groupedBreeds[i].map(breed => breed.name)
            };
        }
        
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ ${filename}에 JSON 데이터 저장완료`);
    }

    saveToText() {
        const filename = 'src/dog-breed-crawler/korean_dog_breeds.txt';
        const groupedBreeds = this.groupBreedsByGroup();
        
        let content = `한국애견연맹(KKF) 공인 견종 목록\n`;
        content += `출처: https://www.thekkf.or.kr\n`;
        content += `크롤링 날짜: ${new Date().toLocaleString('ko-KR')}\n`;
        content += `총 견종 수: ${this.dogBreeds.length}개\n\n`;
        content += '='.repeat(60) + '\n\n';
        
        for (let group = 1; group <= 10; group++) {
            const breeds = groupedBreeds[group];
            content += `${group}그룹: ${this.getGroupName(group)} (${breeds.length}개)\n`;
            content += '-'.repeat(40) + '\n';
            
            breeds.forEach((breed, index) => {
                content += `${String(index + 1).padStart(2, ' ')}. ${breed.name}\n`;
            });
            
            content += '\n';
        }
        
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`✅ ${filename}에 텍스트 파일 저장완료`);
    }

    saveToCSV() {
        const filename = 'src/dog-breed-crawler/korean_dog_breeds.csv';
        const groupedBreeds = this.groupBreedsByGroup();
        
        let content = 'Group,Group_Name,Breed_Name\n';
        
        for (let groupNum = 1; groupNum <= 10; groupNum++) {
            const group = groupedBreeds[groupNum];
            if (group && group.length > 0) {
                group.forEach(breed => {
                    const escapedBreedName = breed.name.includes(',') ? `"${breed.name}"` : breed.name;
                    const escapedGroupName = this.getGroupName(groupNum).includes(',') ? `"${this.getGroupName(groupNum)}"` : this.getGroupName(groupNum);
                    content += `${groupNum},${escapedGroupName},${escapedBreedName}\n`;
                });
            }
        }
        
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`✅ ${filename}에 CSV 파일 저장완료`);
    }

    saveSimpleList() {
        const filename = 'src/dog-breed-crawler/dog_breeds_simple.txt';
        let content = '한국 공인 견종 목록\n\n';
        
        this.dogBreeds.forEach((breed, index) => {
            content += `${index + 1}. ${breed.name}\n`;
        });
        
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`✅ ${filename}에 간단한 목록 저장완료`);
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('🐕 한국애견연맹(KKF) 공인 견종 목록');
        console.log('='.repeat(60));
        
        const groupedBreeds = this.groupBreedsByGroup();
        
        for (let group = 1; group <= 10; group++) {
            const breeds = groupedBreeds[group];
            console.log(`\n📂 ${group}그룹: ${this.getGroupName(group)} (${breeds.length}개)`);
            console.log('-'.repeat(40));
            
            breeds.forEach((breed, index) => {
                console.log(`${String(index + 1).padStart(2, ' ')}. ${breed.name}`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`🎉 총 ${this.dogBreeds.length}개 견종 수집 완료!`);
        console.log('='.repeat(60));
    }

    // 특정 그룹의 견종만 가져오기
    getBreedsByGroup(groupNumber) {
        return this.dogBreeds.filter(breed => breed.gid === groupNumber);
    }

    // 견종명으로 검색
    searchBreed(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.dogBreeds.filter(breed => 
            breed.name.toLowerCase().includes(term)
        );
    }

    // 통계 정보 출력
    printStats() {
        const groupedBreeds = this.groupBreedsByGroup();
        console.log('\n📊 그룹별 견종 통계:');
        for (let i = 1; i <= 10; i++) {
            const count = groupedBreeds[i].length;
            console.log(`${i}그룹: ${count}개 견종`);
        }
    }

    // 견종명만 배열로 반환
    getAllBreedNames() {
        return this.dogBreeds.map(breed => breed.name);
    }
}

// 실행 함수
async function main() {
    const crawler = new DogBreedCrawler();
    
    try {
        await crawler.crawlAllPages();
        crawler.printResults();
        crawler.printStats();
        crawler.saveToJson();
        crawler.saveToText();
        crawler.saveToCSV();
        crawler.saveSimpleList();
        
        console.log('\n📁 생성된 파일들:');
        console.log('- src/dog-breed-crawler/korean_dog_breeds.json (JSON 형식 - API용)');
        console.log('- src/dog-breed-crawler/korean_dog_breeds.txt (그룹별 정리된 텍스트)');
        console.log('- src/dog-breed-crawler/korean_dog_breeds.csv (CSV 형식)');
        console.log('- src/dog-breed-crawler/dog_breeds_simple.txt (단순 목록)');
        
        // 견종명만 출력해보기
        console.log('\n🐕 견종명 배열:');
        console.log(JSON.stringify(crawler.getAllBreedNames(), null, 2));
        
    } catch (error) {
        console.error('❌ 크롤링 중 오류 발생:', error);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = DogBreedCrawler;