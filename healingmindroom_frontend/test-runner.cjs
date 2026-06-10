/**
 * Healing Mind Room MVP 비즈니스 로직 및 매칭 알고리즘 검증 러너 (CommonJS)
 */

const { estimateWaves } = require('./scratch-bin/utils/waveEstimator.js');
const { matchFarms } = require('./scratch-bin/utils/matcher.js');
const farms = require('./src/data/farms.json');

console.log('==================================================');
console.log('🌱 Healing Mind Room MVP Algorithm Verify Test 🌱');
console.log('==================================================\n');

// 1. 뇌파 추정기 테스트
console.log('1. [뇌파 추정기 (waveEstimator.ts) 검증]');

const testCase1_1 = { fatigueScore: 5, sleepStatus: 1, tensionLevel: 5 };
const res1_1 = estimateWaves(testCase1_1);
console.log(`- 극도 피로군 (피로5/수면1/긴장5) -> 예측: theta 우세`);
console.log(`  결과: 알파파 ${Math.round(res1_1.alpha * 100)}% | 세타파 ${Math.round(res1_1.theta * 100)}% | 우세뇌파 [${res1_1.dominant}]`);
const assert1_1 = res1_1.dominant === 'theta' ? '✅ PASS' : '❌ FAIL';
console.log(`  상태: ${assert1_1}\n`);

const testCase1_2 = { fatigueScore: 1, sleepStatus: 5, tensionLevel: 1 };
const res1_2 = estimateWaves(testCase1_2);
console.log(`- 완전 안정군 (피로1/수면5/긴장1) -> 예측: alpha 우세`);
console.log(`  결과: 알파파 ${Math.round(res1_2.alpha * 100)}% | 세타파 ${Math.round(res1_2.theta * 100)}% | 우세뇌파 [${res1_2.dominant}]`);
const assert1_2 = res1_2.dominant === 'alpha' ? '✅ PASS' : '❌ FAIL';
console.log(`  상태: ${assert1_2}\n`);


// 2. 농장 매칭 알고리즘 테스트
console.log('2. [농장 매칭 및 스코어링 (matcher.ts) 검증]');

const testCase2_1 = {
  selectedAge: '30s',
  dominantWave: 'alpha',
  keywords: ['직장', '스트레스']
};
const res2_1 = matchFarms(farms, testCase2_1);
console.log(`- 시나리오 1: 30대 직장인 / 안정이 필요한 상태 / 고민 키워드: 직장, 스트레스`);
console.log(`  추천 결과 (상위 3개):`);
res2_1.forEach((farm, idx) => {
  console.log(`    [${idx + 1}위] ${farm.name} (지역: ${farm.area} | 유형: ${farm.waveType} | 대상연령: ${farm.targetAges.join(', ')})`);
});
// 30대 타깃이면서 120개 농장 중 30대 추천 농장이 상위에 올라왔는지 확인
const assert2_1 = res2_1[0].targetAges.includes('30s') ? '✅ PASS' : '❌ FAIL';
console.log(`  상태: ${assert2_1}\n`);

const testCase2_2 = {
  selectedAge: '60s',
  dominantWave: 'theta',
  keywords: ['건강', '노후']
};
const res2_2 = matchFarms(farms, testCase2_2);
console.log(`- 시나리오 2: 60대 실버 / 피로 해소가 시급한 상태 / 고민 키워드: 건강, 노후`);
console.log(`  추천 결과 (상위 3개):`);
res2_2.forEach((farm, idx) => {
  console.log(`    [${idx + 1}위] ${farm.name} (지역: ${farm.area} | 유형: ${farm.waveType} | 대상연령: ${farm.targetAges.join(', ')})`);
});
// 60대 타깃이면서 120개 농장 중 60대 추천 농장이 상위에 포진되는지 확인
const assert2_2 = res2_2[0].targetAges.includes('60s') ? '✅ PASS' : '❌ FAIL';
console.log(`  상태: ${assert2_2}\n`);

console.log('==================================================');
console.log('🎉 All Core Logic Tests Verification Completed 🎉');
console.log('==================================================');
