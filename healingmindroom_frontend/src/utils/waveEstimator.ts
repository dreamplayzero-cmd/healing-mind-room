import type { WaveEstimateInput, WaveEstimateResult } from '../types';

/**
 * 피로도, 수면상태, 긴장도를 바탕으로 알파파/세타파 비율을 추정합니다.
 */
export function estimateWaves(input: WaveEstimateInput): WaveEstimateResult {
  const { fatigueScore, sleepStatus, tensionLevel } = input;

  // 1. 피로도 정규화 (1~5 -> 0.0~1.0)
  const normalizedFatigue = (Math.max(1, Math.min(5, fatigueScore)) - 1) / 4;

  // 2. 수면 상태 정규화 (1~5 -> 0.0~1.0, 5점=매우 숙면=1.0, 1점=매우 불면=0.0)
  const sleepValue = (Math.max(1, Math.min(5, sleepStatus)) - 1) / 4;

  // 3. 긴장도 정규화 (1~5 -> 0.0~1.0, 5점=매우 예민=1.0, 1점=매우 안정=0.0)
  const tensionValue = (Math.max(1, Math.min(5, tensionLevel)) - 1) / 4;

  // 4. 세타파(피로) 추정 공식: (피로도 * 0.4) + ((1 - 수면상태) * 0.3) + (긴장도 * 0.3)
  const theta = (normalizedFatigue * 0.4) + ((1.0 - sleepValue) * 0.3) + (tensionValue * 0.3);

  // 5. 알파파(안정) 추정 공식: 1.0 - 세타파
  const alpha = 1.0 - theta;

  // 소수점 둘째 자리까지 반올림
  const roundedAlpha = Math.round(alpha * 100) / 100;
  const roundedTheta = Math.round(theta * 100) / 100;

  // 우세 뇌파 결정
  const dominant = roundedAlpha >= roundedTheta ? 'alpha' : 'theta';

  return {
    alpha: roundedAlpha,
    theta: roundedTheta,
    dominant
  };
}
