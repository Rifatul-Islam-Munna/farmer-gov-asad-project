import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoDetectionService {
  diagnose() {
    return {
      provider: 'demo',
      diagnosis: {
        code: 'brown-planthopper',
        name: 'Brown Planthopper',
        type: 'insect',
        confidence: 0.91,
        symptoms: [
          'Yellowing and drying near the base of rice plants',
          'Clusters of small brown insects around the stem',
        ],
        risk: 'medium',
      },
      treatment: {
        steps: [
          'Inspect nearby plants before treatment',
          'Remove heavily affected plant material',
          'Use only an approved product and follow its label',
        ],
        medicineCodes: ['neem-oil', 'imidacloprid'],
        safety: [
          'Wear gloves and a mask',
          'Keep children and animals away during application',
          'Do not exceed the product label dose',
        ],
      },
      demo: true,
    };
  }

  identifyGood() {
    return {
      provider: 'demo',
      good: {
        code: 'potato',
        name: 'Potato',
        categoryCode: 'vegetable',
        defaultUnit: 'kg',
        confidence: 0.93,
      },
      editable: true,
      demo: true,
    };
  }
}
