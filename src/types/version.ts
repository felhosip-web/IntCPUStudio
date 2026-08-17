export type VersionCategory = 'major' | 'minor' | 'patch';

export interface VersionChangeItem {
  type: 'feature' | 'improvement' | 'fix' | 'architecture' | 'docs';
  module: '74HC595' | 'ADC' | 'PWM' | 'CPU' | 'C64' | 'MMIO' | 'BLOCKS' | 'PIPELINE' | 'CACHE' | 'CORE';
  title: string;
  titleHu: string;
  description: string;
  descriptionHu: string;
  details?: string[];
  detailsHu?: string[];
}

export interface VersionEntry {
  version: string;
  releaseDate: string;
  title: string;
  titleHu: string;
  category: VersionCategory;
  summary: string;
  summaryHu: string;
  highlights: {
    en: string[];
    hu: string[];
  };
  changes: VersionChangeItem[];
  breakingChanges?: {
    en: string[];
    hu: string[];
  };
  technicalNotes?: {
    en: string;
    hu: string;
  };
}

export interface HelpTopic {
  id: string;
  iconName: string;
  title: string;
  titleHu: string;
  category: 'START' | '74HC595' | 'ADC_PWM' | 'CPU_MMIO' | 'C64' | 'BLOCKS' | 'SHORTCUTS' | 'FAQ';
  categoryHu: string;
  badge?: string;
  summary: string;
  summaryHu: string;
  content: string;
  contentHu: string;
  codeSnippets?: {
    title: string;
    code: string;
    language: 'assembly' | 'cpp' | 'basic' | 'c';
  }[];
  keyTerms?: {
    term: string;
    termHu: string;
    definition: string;
    definitionHu: string;
  }[];
  relatedTopics?: string[];
}
