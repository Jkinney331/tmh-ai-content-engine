'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Code2,
  Settings,
  TestTube2,
  Filter,
  ChevronDown
} from 'lucide-react';
import { PromptTemplateEditor } from '@/components/PromptTemplateEditor';

interface PromptTemplate {
  id: string;
  name: string;
  category: 'lifestyle' | 'street_style' | 'product' | 'comparison' | 'industrial';
  model_target: string;
  prompt: string;
  variables: TemplateVariable[];
  settings: TemplateSettings;
  created_at: string;
  updated_at: string;
  usage_count: number;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'color' | 'boolean';
  description?: string;
  options?: string[];
  defaultValue?: string;
}

interface TemplateSettings {
  aspect_ratio?: string;
  quality?: 'standard' | 'high' | 'ultra';
  style?: Record<string, any>;
  temperature?: number;
  max_tokens?: number;
}

const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: '1',
    name: 'Urban Lifestyle Shot',
    category: 'lifestyle',
    model_target: 'openrouter/nano-banana',
    prompt: 'Create a lifestyle photo of a person wearing a {hoodie_color} TMH hoodie in {location}. The scene should be {mood} with {lighting} lighting. Include urban elements like {urban_elements}.',
    variables: [
      { name: 'hoodie_color', type: 'select', options: ['black', 'gray', 'white', 'navy'], defaultValue: 'black' },
      { name: 'location', type: 'text', defaultValue: 'downtown street' },
      { name: 'mood', type: 'select', options: ['energetic', 'relaxed', 'confident', 'contemplative'], defaultValue: 'confident' },
      { name: 'lighting', type: 'select', options: ['golden hour', 'natural', 'neon', 'dramatic'], defaultValue: 'golden hour' },
      { name: 'urban_elements', type: 'text', defaultValue: 'graffiti walls and street art' }
    ],
    settings: {
      aspect_ratio: '16:9',
      quality: 'high',
      style: { color_scheme: 'vibrant', mood: 'urban' }
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    usage_count: 42
  },
  {
    id: '2',
    name: 'Product Showcase',
    category: 'product',
    model_target: 'openrouter/flux-pro',
    prompt: 'Professional product photo of {product_name} on a {background} background. Show {angle} angle with {lighting_type} lighting. Highlight {features}.',
    variables: [
      { name: 'product_name', type: 'text', defaultValue: 'TMH hoodie' },
      { name: 'background', type: 'select', options: ['white', 'black', 'gradient', 'textured'], defaultValue: 'white' },
      { name: 'angle', type: 'select', options: ['front', '3/4', 'side', 'detail'], defaultValue: 'front' },
      { name: 'lighting_type', type: 'select', options: ['studio', 'soft', 'dramatic', 'natural'], defaultValue: 'studio' },
      { name: 'features', type: 'text', defaultValue: 'premium fabric texture and logo detail' }
    ],
    settings: {
      aspect_ratio: '1:1',
      quality: 'ultra',
      style: { mood: 'professional', focus: 'product' }
    },
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    usage_count: 28
  },
  {
    id: '3',
    name: 'Street Style Comparison',
    category: 'comparison',
    model_target: 'openrouter/dall-e-3',
    prompt: 'Create a split-screen comparison: Left side shows {style_a} fashion in {city_a}, right side shows {style_b} fashion in {city_b}. Both featuring TMH hoodies. {additional_details}',
    variables: [
      { name: 'style_a', type: 'text', defaultValue: 'minimalist' },
      { name: 'city_a', type: 'text', defaultValue: 'Tokyo' },
      { name: 'style_b', type: 'text', defaultValue: 'streetwear' },
      { name: 'city_b', type: 'text', defaultValue: 'New York' },
      { name: 'additional_details', type: 'text', defaultValue: 'Show cultural fashion differences' }
    ],
    settings: {
      aspect_ratio: '16:9',
      quality: 'high',
      style: { layout: 'split-screen', theme: 'comparison' }
    },
    created_at: '2024-01-12T11:30:00Z',
    updated_at: '2024-01-19T13:20:00Z',
    usage_count: 15
  }
];

const CATEGORY_LABELS = {
  lifestyle: 'Lifestyle',
  street_style: 'Street Style',
  product: 'Product',
  comparison: 'Comparison',
  industrial: 'Industrial'
};

const CATEGORY_COLORS = {
  lifestyle: 'bg-purple-100 text-purple-700 border-purple-200',
  street_style: 'bg-orange-100 text-orange-700 border-orange-200',
  product: 'bg-blue-100 text-blue-700 border-blue-200',
  comparison: 'bg-green-100 text-green-700 border-green-200',
  industrial: 'bg-gray-100 text-gray-700 border-gray-200'
};

export default function PromptsPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setEditorMode('create');
    setShowEditor(true);
  };

  const handleEdit = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setEditorMode('edit');
    setShowEditor(true);
  };

  const handleDuplicate = (template: PromptTemplate) => {
    // Create a copy with a new name
    const duplicatedTemplate = {
      ...template,
      id: '', // Clear ID so it will be treated as new
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0
    };

    // Open editor with duplicated content
    setSelectedTemplate(duplicatedTemplate);
    setEditorMode('create'); // Important: use 'create' mode for duplicates
    setShowEditor(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleSaveTemplate = (templateData: any) => {
    if (editorMode === 'create' || !templateData.id) {
      // Create new template (including duplicates)
      const newTemplate: PromptTemplate = {
        ...templateData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
    } else {
      // Update existing template
      setTemplates(prev => prev.map(t =>
        t.id === templateData.id
          ? { ...templateData, updated_at: new Date().toISOString() }
          : t
      ));
    }
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return templates.length;
    return templates.filter(t => t.category === category).length;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prompt Templates</h1>
            <p className="mt-2 text-gray-600">
              Manage and organize your AI generation prompts
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories ({getCategoryCount('all')})</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({getCategoryCount(value)})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${CATEGORY_COLORS[template.category]}`}>
                      {CATEGORY_LABELS[template.category]}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {template.model_target.split('/')[1]}
                    </span>
                  </div>

                  {/* Prompt Preview */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-mono">
                    {template.prompt}
                  </p>

                  {/* Variables */}
                  {template.variables.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-500">Variables:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span
                            key={variable.name}
                            className="px-2 py-0.5 text-xs font-mono bg-blue-50 text-blue-600 border border-blue-200 rounded"
                          >
                            {variable.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Used {template.usage_count} times</span>
                    {template.settings.aspect_ratio && (
                      <>
                        <span>•</span>
                        <span>{template.settings.aspect_ratio}</span>
                      </>
                    )}
                    {template.settings.quality && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{template.settings.quality}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit template"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Duplicate template"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first prompt template'}
            </p>
            {(!searchQuery && selectedCategory === 'all') && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create Template
              </button>
            )}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <PromptTemplateEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
          }}
          onSave={handleSaveTemplate}
          template={selectedTemplate}
          mode={editorMode}
        />
      )}
    </div>
  );
}