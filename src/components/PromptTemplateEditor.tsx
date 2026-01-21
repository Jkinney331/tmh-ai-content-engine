'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertCircle, Code2, Variable, Settings, Play, TestTube2, ChevronRight, Loader2 } from 'lucide-react';

interface PromptTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: PromptTemplateData) => void;
  template?: PromptTemplateData | null;
  mode?: 'create' | 'edit';
}

interface PromptTemplateData {
  id?: string;
  name: string;
  category: 'lifestyle' | 'street_style' | 'product' | 'comparison' | 'industrial';
  model_target: string;
  prompt: string;
  variables: TemplateVariable[];
  settings: TemplateSettings;
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

const MODEL_OPTIONS = [
  { value: 'openrouter/nano-banana', label: 'Nano Banana (Fast)' },
  { value: 'openrouter/sora-3', label: 'Sora 3 (Video)' },
  { value: 'openrouter/flux-pro', label: 'Flux Pro (Quality)' },
  { value: 'openrouter/stable-diffusion-xl', label: 'SDXL (Standard)' },
  { value: 'openrouter/dall-e-3', label: 'DALL-E 3 (Premium)' },
];

const CATEGORY_OPTIONS = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'street_style', label: 'Street Style' },
  { value: 'product', label: 'Product' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'industrial', label: 'Industrial' },
];

const VARIABLE_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'color', label: 'Color' },
  { value: 'boolean', label: 'Boolean' },
];

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:4', label: 'Vertical (3:4)' },
];

export function PromptTemplateEditor({
  isOpen,
  onClose,
  onSave,
  template,
  mode = 'create'
}: PromptTemplateEditorProps) {
  const [formData, setFormData] = useState<PromptTemplateData>({
    name: '',
    category: 'lifestyle',
    model_target: 'openrouter/nano-banana',
    prompt: '',
    variables: [],
    settings: {
      aspect_ratio: '1:1',
      quality: 'standard',
      style: {}
    }
  });

  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [styleJson, setStyleJson] = useState('{}');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Test mode state
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testVariables, setTestVariables] = useState<Record<string, any>>({});
  const [renderedPrompt, setRenderedPrompt] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData(template);
      setStyleJson(JSON.stringify(template.settings.style || {}, null, 2));
    } else {
      setFormData({
        name: '',
        category: 'lifestyle',
        model_target: 'openrouter/nano-banana',
        prompt: '',
        variables: [],
        settings: {
          aspect_ratio: '1:1',
          quality: 'standard',
          style: {}
        }
      });
      setStyleJson('{}');
    }
  }, [template]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt text is required';
    }

    if (formData.variables.some(v => !v.name.trim())) {
      newErrors.variables = 'All variables must have a name';
    }

    if (formData.variables.some(v => v.type === 'select' && (!v.options || v.options.length === 0))) {
      newErrors.variables = 'Select variables must have at least one option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    try {
      if (showJsonEditor) {
        const parsedStyle = JSON.parse(styleJson);
        formData.settings.style = parsedStyle;
      }
      onSave(formData);
      onClose();
    } catch (error) {
      setJsonError('Invalid JSON format in style settings');
    }
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [
        ...formData.variables,
        {
          name: '',
          type: 'text',
          description: '',
          defaultValue: ''
        }
      ]
    });
  };

  const updateVariable = (index: number, field: keyof TemplateVariable, value: any) => {
    const updatedVariables = [...formData.variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value
    };
    setFormData({
      ...formData,
      variables: updatedVariables
    });
  };

  const removeVariable = (index: number) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  const extractVariablesFromPrompt = () => {
    const regex = /\{([^}]+)\}/g;
    const matches = formData.prompt.match(regex);
    if (matches) {
      const variableNames = matches.map(m => m.slice(1, -1));
      const existingNames = formData.variables.map(v => v.name);
      const newVariables = variableNames
        .filter(name => !existingNames.includes(name))
        .map(name => ({
          name,
          type: 'text' as const,
          description: '',
          defaultValue: ''
        }));

      if (newVariables.length > 0) {
        setFormData({
          ...formData,
          variables: [...formData.variables, ...newVariables]
        });
      }
    }
  };

  const handleStyleJsonChange = (value: string) => {
    setStyleJson(value);
    setJsonError(null);
    try {
      JSON.parse(value);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  // Test mode functions
  const openTestPanel = () => {
    // Initialize test variables with default values
    const initialTestVars: Record<string, any> = {};
    formData.variables.forEach(variable => {
      initialTestVars[variable.name] = variable.defaultValue ||
        (variable.type === 'boolean' ? false :
         variable.type === 'number' ? 0 :
         variable.type === 'select' && variable.options ? variable.options[0] : '');
    });
    setTestVariables(initialTestVars);
    setRenderedPrompt('');
    setTestResponse(null);
    setTestError(null);
    setShowTestPanel(true);
  };

  const closeTestPanel = () => {
    setShowTestPanel(false);
    setTestVariables({});
    setRenderedPrompt('');
    setTestResponse(null);
    setTestError(null);
  };

  const renderPromptWithVariables = () => {
    let rendered = formData.prompt;
    Object.entries(testVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });
    return rendered;
  };

  const runTest = async () => {
    setIsTestRunning(true);
    setTestError(null);
    setTestResponse(null);

    try {
      // Render the prompt with test variables
      const rendered = renderPromptWithVariables();
      setRenderedPrompt(rendered);

      // Determine if this is an image or text generation based on model
      const isImageModel = formData.model_target.includes('banana') ||
                          formData.model_target.includes('sora') ||
                          formData.model_target.includes('flux') ||
                          formData.model_target.includes('stable-diffusion') ||
                          formData.model_target.includes('dall-e');

      if (isImageModel) {
        // For image models, just show what would be generated
        setTestResponse(`[Image Generation Preview]
Model: ${formData.model_target}
Aspect Ratio: ${formData.settings.aspect_ratio || '1:1'}
Quality: ${formData.settings.quality || 'standard'}

This prompt would generate an image with the above settings.
The actual image generation would occur when using this template in production.`);
      } else {
        // For text models, we can actually test with Claude
        const response = await fetch('/api/test-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: rendered,
            temperature: formData.settings.temperature || 0.7,
            max_tokens: formData.settings.max_tokens || 1024,
          }),
        });

        if (!response.ok) {
          throw new Error(`Test failed: ${response.statusText}`);
        }

        const data = await response.json();
        setTestResponse(data.response || 'No response received');
      }
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'Test failed');
      console.error('Test error:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  const updateTestVariable = (name: string, value: any) => {
    setTestVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create Prompt Template' : 'Edit Prompt Template'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={openTestPanel}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <TestTube2 className="h-4 w-4" />
                Test Template
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  Basic Information
                </h3>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Urban Lifestyle Shot"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CATEGORY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model Target *
                    </label>
                    <select
                      id="model"
                      value={formData.model_target}
                      onChange={(e) => setFormData({ ...formData, model_target: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {MODEL_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Prompt Text */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Prompt Text
                  </h3>
                  <button
                    onClick={extractVariablesFromPrompt}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Extract Variables
                  </button>
                </div>

                <div>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                      errors.prompt ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={6}
                    placeholder="Enter your prompt template. Use {variable_name} for dynamic values..."
                  />
                  {errors.prompt && (
                    <p className="mt-1 text-xs text-red-600">{errors.prompt}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Use curly braces to define variables, e.g., {`{city_name}`}, {`{hoodie_color}`}
                  </p>
                </div>
              </div>

              {/* Variables */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Variable className="h-4 w-4" />
                    Variables
                  </h3>
                  <button
                    onClick={addVariable}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Variable
                  </button>
                </div>

                {errors.variables && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{errors.variables}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.variables.map((variable, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={variable.name}
                              onChange={(e) => updateVariable(index, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="variable_name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Type
                            </label>
                            <select
                              value={variable.type}
                              onChange={(e) => updateVariable(index, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            >
                              {VARIABLE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Default Value
                            </label>
                            <input
                              type="text"
                              value={variable.defaultValue || ''}
                              onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeVariable(index)}
                          className="mt-6 p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variable.description || ''}
                          onChange={(e) => updateVariable(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Brief description of this variable"
                        />
                      </div>

                      {variable.type === 'select' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Options (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={variable.options?.join(', ') || ''}
                            onChange={(e) => updateVariable(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="option1, option2, option3"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {formData.variables.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Variable className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No variables defined</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Extract Variables" or "Add Variable" to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Generation Settings
                  </h3>
                  <button
                    onClick={() => setShowJsonEditor(!showJsonEditor)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showJsonEditor ? 'Use Form' : 'Edit JSON'}
                  </button>
                </div>

                {!showJsonEditor ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aspect Ratio
                      </label>
                      <select
                        value={formData.settings.aspect_ratio || '1:1'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, aspect_ratio: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {ASPECT_RATIOS.map(ratio => (
                          <option key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quality
                      </label>
                      <select
                        value={formData.settings.quality || 'standard'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, quality: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="standard">Standard</option>
                        <option value="high">High</option>
                        <option value="ultra">Ultra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.settings.temperature || 0.7}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, temperature: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="4000"
                        value={formData.settings.max_tokens || 1024}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, max_tokens: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style Settings (JSON)
                    </label>
                    <textarea
                      value={styleJson}
                      onChange={(e) => handleStyleJsonChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                        jsonError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={8}
                      placeholder='{\n  "color_scheme": "vibrant",\n  "mood": "energetic"\n}'
                    />
                    {jsonError && (
                      <p className="mt-1 text-xs text-red-600">{jsonError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Save Template' : 'Update Template'}
            </button>
          </div>
        </div>

        {/* Test Panel */}
        {showTestPanel && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeTestPanel} />

              <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
                {/* Test Panel Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <TestTube2 className="h-5 w-5" />
                    Test Template
                  </h2>
                  <button
                    onClick={closeTestPanel}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Test Panel Content */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 max-h-[calc(100vh-200px)]">
                  {/* Left side - Variable Inputs */}
                  <div className="p-6 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Template Variables
                    </h3>

                    {formData.variables.length > 0 ? (
                      <div className="space-y-4">
                        {formData.variables.map((variable) => (
                          <div key={variable.name} className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              {variable.name}
                              {variable.description && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({variable.description})
                                </span>
                              )}
                            </label>

                            {variable.type === 'text' && (
                              <input
                                type="text"
                                value={testVariables[variable.name] || ''}
                                onChange={(e) => updateTestVariable(variable.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Enter ${variable.name}`}
                              />
                            )}

                            {variable.type === 'number' && (
                              <input
                                type="number"
                                value={testVariables[variable.name] || 0}
                                onChange={(e) => updateTestVariable(variable.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            )}

                            {variable.type === 'select' && (
                              <select
                                value={testVariables[variable.name] || ''}
                                onChange={(e) => updateTestVariable(variable.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {variable.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}

                            {variable.type === 'color' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={testVariables[variable.name] || '#000000'}
                                  onChange={(e) => updateTestVariable(variable.name, e.target.value)}
                                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={testVariables[variable.name] || '#000000'}
                                  onChange={(e) => updateTestVariable(variable.name, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="#000000"
                                />
                              </div>
                            )}

                            {variable.type === 'boolean' && (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={testVariables[variable.name] || false}
                                  onChange={(e) => updateTestVariable(variable.name, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {testVariables[variable.name] ? 'True' : 'False'}
                                </span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Variable className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No variables defined in template</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add variables to test dynamic values
                        </p>
                      </div>
                    )}

                    {/* Run Test Button */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={runTest}
                        disabled={isTestRunning}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {isTestRunning ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Running Test...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Run Test
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right side - Results */}
                  <div className="p-6 overflow-y-auto">
                    <div className="space-y-6">
                      {/* Rendered Prompt */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          Rendered Prompt
                        </h3>
                        {renderedPrompt ? (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                              {renderedPrompt}
                            </pre>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-sm text-gray-500">
                            Click "Run Test" to see the rendered prompt
                          </div>
                        )}
                      </div>

                      {/* Test Response */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          Test Response
                        </h3>
                        {testError ? (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Test Failed</p>
                                <p className="text-sm text-red-700 mt-1">{testError}</p>
                              </div>
                            </div>
                          </div>
                        ) : testResponse ? (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {testResponse}
                            </pre>
                          </div>
                        ) : isTestRunning ? (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                              <p className="text-sm text-blue-700">Generating response...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-sm text-gray-500">
                            Response will appear here after running the test
                          </div>
                        )}
                      </div>

                      {/* Model Info */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium">Model:</span> {MODEL_OPTIONS.find(m => m.value === formData.model_target)?.label || formData.model_target}
                          </p>
                          <p>
                            <span className="font-medium">Category:</span> {CATEGORY_OPTIONS.find(c => c.value === formData.category)?.label || formData.category}
                          </p>
                          {formData.settings.temperature && (
                            <p>
                              <span className="font-medium">Temperature:</span> {formData.settings.temperature}
                            </p>
                          )}
                          {formData.settings.max_tokens && (
                            <p>
                              <span className="font-medium">Max Tokens:</span> {formData.settings.max_tokens}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}