import type { Farm, MatcherInput } from '../types';

export interface ScoredFarm {
  farm: Farm;
  score: number;
}

/**
 * 뇌파 분석, 연령대, 키워드를 바탕으로 전국 120개(예제 10개) 치유농장 중 최적의 농장 2~3개를 추천합니다.
 */
export function matchFarms(farms: Farm[], input: MatcherInput): Farm[] {
  const { selectedAge, dominantWave, keywords } = input;

  const scoredFarms: ScoredFarm[] = farms.map((farm) => {
    let score = 0;

    // 1. 연령대 매칭 (+50점)
    if (farm.targetAges && farm.targetAges.includes(selectedAge)) {
      score += 50;
    }

    // 2. 뇌파 상태 매칭 (+30점)
    // alpha 우세인 사용자에게는 alpha 농장(안정 위주), theta 우세인 사용자에게는 theta 농장(활동 위주) 추천
    if (farm.waveType === dominantWave) {
      score += 30;
    }

    // 3. 고민 키워드 매칭 (개당 +10점, 최대 +30점)
    if (keywords && keywords.length > 0) {
      let keywordMatches = 0;
      keywords.forEach((keyword) => {
        if (!keyword || typeof keyword !== 'string') return;
        const lowerKeyword = keyword.toLowerCase();
        
        // 농장 이름, 소개글, 프로그램 목록에서 키워드가 포함되는지 확인
        const inName = farm.name && farm.name.toLowerCase().includes(lowerKeyword);
        const inDesc = farm.description && farm.description.toLowerCase().includes(lowerKeyword);
        const inPrograms = farm.programs && farm.programs.some((p: string) => p && typeof p === 'string' && p.toLowerCase().includes(lowerKeyword));

        if (inName || inDesc || inPrograms) {
          keywordMatches++;
        }
      });
      // 최대 3개 키워드까지 점수 반영
      score += Math.min(3, keywordMatches) * 10;
    }

    return { farm, score };
  });

  // 점수가 높은 순으로 정렬하고 상위 3개 농장 추출 (중복 제거)
  const sortedFarms = scoredFarms
    .sort((a, b) => b.score - a.score)
    .map((sf) => sf.farm);

  const uniqueFarms: Farm[] = [];
  const seenNames = new Set<string>();
  for (const farm of sortedFarms) {
    if (!seenNames.has(farm.name)) {
      seenNames.add(farm.name);
      uniqueFarms.push(farm);
    }
  }

  return uniqueFarms.slice(0, 3);
}
