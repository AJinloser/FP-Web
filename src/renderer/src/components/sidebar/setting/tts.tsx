import { Stack, createListCollection } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/websocket-context';
import { settingStyles } from './setting-styles';
import { SelectField, InputField } from './common';

interface TTSProps {
  onSave?: (callback: () => void) => () => void;
  onCancel?: (callback: () => void) => () => void;
}

// 定义所有TTS模型的配置接口
interface AzureTTSConfig {
  api_key: string;
  region: string;
  voice: string;
  pitch: string;
  rate: string;
}

interface BarkTTSConfig {
  voice: string;
}

interface EdgeTTSConfig {
  voice: string;
}

interface CosyvoiceTTSConfig {
  client_url: string;
  mode_checkbox_group: string;
  sft_dropdown: string;
  prompt_text: string;
  prompt_wav_upload_url: string;
  prompt_wav_record_url: string;
  instruct_text: string;
  seed: number;
  api_name: string;
}

interface MeloTTSConfig {
  speaker: string;
  language: string;
  device: string;
  speed: number;
}

interface XTTSConfig {
  api_url: string;
  speaker_wav: string;
  language: string;
}

interface GPTSoVITSConfig {
  api_url: string;
  text_lang: string;
  ref_audio_path: string;
  prompt_lang: string;
  prompt_text: string;
  text_split_method: string;
  batch_size: string;
  media_type: string;
  streaming_mode: string;
}

interface FishAPITTSConfig {
  api_key: string;
  reference_id: string;
  latency: 'normal' | 'balanced';
  base_url: string;
}

interface CoquiTTSConfig {
  model_name: string;
  speaker_wav: string;
  language: string;
  device: string;
}

interface SherpaOnnxTTSConfig {
  vits_model: string;
  vits_lexicon?: string;
  vits_tokens: string;
  vits_data_dir?: string;
  vits_dict_dir?: string;
  tts_rule_fsts?: string;
  max_num_sentences: number;
  sid: number;
  provider: 'cpu' | 'cuda' | 'coreml';
  num_threads: number;
  speed: number;
  debug: boolean;
}

// 总的TTS设置接口
interface TTSSettings {
  tts_model: string;
  azure_tts?: AzureTTSConfig;
  bark_tts?: BarkTTSConfig;
  edge_tts?: EdgeTTSConfig;
  cosyvoice_tts?: CosyvoiceTTSConfig;
  melo_tts?: MeloTTSConfig;
  x_tts?: XTTSConfig;
  gpt_sovits_tts?: GPTSoVITSConfig;
  fish_api_tts?: FishAPITTSConfig;
  coqui_tts?: CoquiTTSConfig;
  sherpa_onnx_tts?: SherpaOnnxTTSConfig;
}

function TTS({ onSave, onCancel }: TTSProps): JSX.Element {
  const { sendMessage } = useWebSocket();
  // 当前生效的设置
  const [currentSettings, setCurrentSettings] = useState<TTSSettings>({ tts_model: '' });
  // 用户修改但未保存的设置
  const [pendingSettings, setPendingSettings] = useState<TTSSettings>({ tts_model: '' });
  // 可用的TTS模型列表
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // 初始化：获取可用模型列表和当前设置
  useEffect(() => {
    const handleTTSModels = (event: CustomEvent) => {
      const { available_tts_models, current_tts_model } = event.detail;
      setAvailableModels(available_tts_models);
      
      // 如果收到当前模型信息，请求该模型的具体设置
      if (current_tts_model) {
        sendMessage({
          type: 'fetch-tts-settings',
          tts_model: current_tts_model
        });
      }
    };

    const handleTTSSettings = (event: CustomEvent) => {
      const newSettings = event.detail;
      setCurrentSettings(newSettings);
      setPendingSettings(newSettings);
    };

    // 注册事件监听器
    window.addEventListener('tts-models-update', handleTTSModels as EventListener);
    window.addEventListener('tts-settings-update', handleTTSSettings as EventListener);

    // 获取可用模型列表（包含当前模型信息）
    sendMessage({ type: 'fetch-tts-models' });

    // 清理事件监听器
    return () => {
      window.removeEventListener('tts-models-update', handleTTSModels as EventListener);
      window.removeEventListener('tts-settings-update', handleTTSSettings as EventListener);
    };
  }, [sendMessage]);

  // 处理模型切换
  const handleModelChange = (newModel: string) => {
    // 更新pending设置中的模型
    setPendingSettings(prev => ({ ...prev, tts_model: newModel }));
    // 请求新模型的具体设置
    sendMessage({
      type: 'fetch-tts-settings',
      tts_model: newModel
    });
  };

  // 处理设置项变更
  const handleSettingChange = (key: string, value: any) => {
    if (key === 'tts_model') {
      handleModelChange(value);
    } else {
      setPendingSettings(prev => ({
        ...prev,
        [prev.tts_model]: {
          ...((prev[prev.tts_model as keyof TTSSettings] as Record<string, any>) || {}),
          [key]: value
        }
      }));
    }
  };

  // 注册保存回调
  useEffect(() => {
    if (!onSave) return;

    const cleanup = onSave(() => {
      // 发送更新后的设置到后端
      sendMessage({
        type: 'update-tts-settings',
        settings: pendingSettings
      });
      // 更新当前设置
      setCurrentSettings(pendingSettings);
    });

    return cleanup;
  }, [onSave, pendingSettings, sendMessage]);

  // 注册取消回调
  useEffect(() => {
    if (!onCancel) return;

    const cleanup = onCancel(() => {
      // 恢复到当前设置
      setPendingSettings(currentSettings);
    });

    return cleanup;
  }, [onCancel, currentSettings]);

  // 渲染模型配置
  const renderModelConfig = () => {
    if (!pendingSettings.tts_model) return null;

    const modelConfig = pendingSettings[pendingSettings.tts_model as keyof TTSSettings];
    if (!modelConfig) return null;

    switch (pendingSettings.tts_model) {
      case 'azure_tts':
        return (
          <>
            <InputField
              label="API Key"
              value={(modelConfig as AzureTTSConfig).api_key || ''}
              onChange={(value) => handleSettingChange('api_key', value)}
              placeholder="Enter Azure API Key"
            />
            <InputField
              label="Region"
              value={(modelConfig as AzureTTSConfig).region || ''}
              onChange={(value) => handleSettingChange('region', value)}
              placeholder="Enter Azure Region"
            />
            <InputField
              label="Voice"
              value={(modelConfig as AzureTTSConfig).voice || ''}
              onChange={(value) => handleSettingChange('voice', value)}
              placeholder="Enter Voice Name"
            />
            <InputField
              label="Pitch"
              value={(modelConfig as AzureTTSConfig).pitch || ''}
              onChange={(value) => handleSettingChange('pitch', value)}
              placeholder="Enter Pitch"
            />
            <InputField
              label="Rate"
              value={(modelConfig as AzureTTSConfig).rate || ''}
              onChange={(value) => handleSettingChange('rate', value)}
              placeholder="Enter Rate"
            />
          </>
        );

      case 'bark_tts':
        return (
          <InputField
            label="Voice"
            value={(modelConfig as BarkTTSConfig).voice || ''}
            onChange={(value) => handleSettingChange('voice', value)}
            placeholder="Enter Voice Name"
          />
        );

      case 'edge_tts':
        return (
          <InputField
            label="Voice"
            value={(modelConfig as EdgeTTSConfig).voice || ''}
            onChange={(value) => handleSettingChange('voice', value)}
            placeholder="Enter Voice Name (e.g., zh-CN-XiaoxiaoNeural)"
          />
        );

      case 'cosyvoice_tts':
        return (
          <>
            <InputField
              label="Client URL"
              value={(modelConfig as CosyvoiceTTSConfig).client_url || ''}
              onChange={(value) => handleSettingChange('client_url', value)}
              placeholder="Enter Client URL"
            />
            <InputField
              label="Mode Checkbox Group"
              value={(modelConfig as CosyvoiceTTSConfig).mode_checkbox_group || ''}
              onChange={(value) => handleSettingChange('mode_checkbox_group', value)}
              placeholder="Enter Mode Checkbox Group"
            />
            <InputField
              label="SFT Dropdown"
              value={(modelConfig as CosyvoiceTTSConfig).sft_dropdown || ''}
              onChange={(value) => handleSettingChange('sft_dropdown', value)}
              placeholder="Enter SFT Dropdown"
            />
            <InputField
              label="Prompt Text"
              value={(modelConfig as CosyvoiceTTSConfig).prompt_text || ''}
              onChange={(value) => handleSettingChange('prompt_text', value)}
              placeholder="Enter Prompt Text"
            />
            <InputField
              label="Prompt WAV Upload URL"
              value={(modelConfig as CosyvoiceTTSConfig).prompt_wav_upload_url || ''}
              onChange={(value) => handleSettingChange('prompt_wav_upload_url', value)}
              placeholder="Enter Prompt WAV Upload URL"
            />
            <InputField
              label="Prompt WAV Record URL"
              value={(modelConfig as CosyvoiceTTSConfig).prompt_wav_record_url || ''}
              onChange={(value) => handleSettingChange('prompt_wav_record_url', value)}
              placeholder="Enter Prompt WAV Record URL"
            />
            <InputField
              label="Instruct Text"
              value={(modelConfig as CosyvoiceTTSConfig).instruct_text || ''}
              onChange={(value) => handleSettingChange('instruct_text', value)}
              placeholder="Enter Instruct Text"
            />
            <InputField
              label="Seed"
              value={String((modelConfig as CosyvoiceTTSConfig).seed) || '0'}
              onChange={(value) => handleSettingChange('seed', parseInt(value))}
              placeholder="Enter Seed"
            />
            <InputField
              label="API Name"
              value={(modelConfig as CosyvoiceTTSConfig).api_name || ''}
              onChange={(value) => handleSettingChange('api_name', value)}
              placeholder="Enter API Name"
            />
          </>
        );

      case 'melo_tts':
        return (
          <>
            <InputField
              label="Speaker"
              value={(modelConfig as MeloTTSConfig).speaker || ''}
              onChange={(value) => handleSettingChange('speaker', value)}
              placeholder="Enter Speaker Name"
            />
            <InputField
              label="Language"
              value={(modelConfig as MeloTTSConfig).language || ''}
              onChange={(value) => handleSettingChange('language', value)}
              placeholder="Enter Language Code"
            />
            <InputField
              label="Device"
              value={(modelConfig as MeloTTSConfig).device || 'auto'}
              onChange={(value) => handleSettingChange('device', value)}
              placeholder="Enter Device (auto, cpu, cuda)"
            />
            <InputField
              label="Speed"
              value={String((modelConfig as MeloTTSConfig).speed) || '1.0'}
              onChange={(value) => handleSettingChange('speed', parseFloat(value))}
              placeholder="Enter Speed"
            />
          </>
        );

      case 'x_tts':
        return (
          <>
            <InputField
              label="API URL"
              value={(modelConfig as XTTSConfig).api_url || ''}
              onChange={(value) => handleSettingChange('api_url', value)}
              placeholder="Enter API URL"
            />
            <InputField
              label="Speaker WAV"
              value={(modelConfig as XTTSConfig).speaker_wav || ''}
              onChange={(value) => handleSettingChange('speaker_wav', value)}
              placeholder="Enter Speaker WAV Path"
            />
            <InputField
              label="Language"
              value={(modelConfig as XTTSConfig).language || ''}
              onChange={(value) => handleSettingChange('language', value)}
              placeholder="Enter Language Code"
            />
          </>
        );

      case 'gpt_sovits_tts':
        return (
          <>
            <InputField
              label="API URL"
              value={(modelConfig as GPTSoVITSConfig).api_url || ''}
              onChange={(value) => handleSettingChange('api_url', value)}
              placeholder="Enter API URL"
            />
            <InputField
              label="Text Language"
              value={(modelConfig as GPTSoVITSConfig).text_lang || ''}
              onChange={(value) => handleSettingChange('text_lang', value)}
              placeholder="Enter Text Language"
            />
            <InputField
              label="Reference Audio Path"
              value={(modelConfig as GPTSoVITSConfig).ref_audio_path || ''}
              onChange={(value) => handleSettingChange('ref_audio_path', value)}
              placeholder="Enter Reference Audio Path"
            />
            <InputField
              label="Prompt Language"
              value={(modelConfig as GPTSoVITSConfig).prompt_lang || ''}
              onChange={(value) => handleSettingChange('prompt_lang', value)}
              placeholder="Enter Prompt Language"
            />
            <InputField
              label="Prompt Text"
              value={(modelConfig as GPTSoVITSConfig).prompt_text || ''}
              onChange={(value) => handleSettingChange('prompt_text', value)}
              placeholder="Enter Prompt Text"
            />
            <InputField
              label="Text Split Method"
              value={(modelConfig as GPTSoVITSConfig).text_split_method || ''}
              onChange={(value) => handleSettingChange('text_split_method', value)}
              placeholder="Enter Text Split Method"
            />
            <InputField
              label="Batch Size"
              value={(modelConfig as GPTSoVITSConfig).batch_size || ''}
              onChange={(value) => handleSettingChange('batch_size', value)}
              placeholder="Enter Batch Size"
            />
            <InputField
              label="Media Type"
              value={(modelConfig as GPTSoVITSConfig).media_type || ''}
              onChange={(value) => handleSettingChange('media_type', value)}
              placeholder="Enter Media Type"
            />
            <InputField
              label="Streaming Mode"
              value={(modelConfig as GPTSoVITSConfig).streaming_mode || ''}
              onChange={(value) => handleSettingChange('streaming_mode', value)}
              placeholder="Enter Streaming Mode"
            />
          </>
        );

      case 'fish_api_tts':
        return (
          <>
            <InputField
              label="API Key"
              value={(modelConfig as FishAPITTSConfig).api_key || ''}
              onChange={(value) => handleSettingChange('api_key', value)}
              placeholder="Enter Fish API Key"
            />
            <InputField
              label="Reference ID"
              value={(modelConfig as FishAPITTSConfig).reference_id || ''}
              onChange={(value) => handleSettingChange('reference_id', value)}
              placeholder="Enter Reference ID"
            />
            <InputField
              label="Latency"
              value={(modelConfig as FishAPITTSConfig).latency || 'normal'}
              onChange={(value) => handleSettingChange('latency', value)}
              placeholder="Enter Latency (normal/balanced)"
            />
            <InputField
              label="Base URL"
              value={(modelConfig as FishAPITTSConfig).base_url || ''}
              onChange={(value) => handleSettingChange('base_url', value)}
              placeholder="Enter Base URL"
            />
          </>
        );

      case 'sherpa_onnx_tts':
        return (
          <>
            <InputField
              label="VITS Model"
              value={(modelConfig as SherpaOnnxTTSConfig).vits_model || ''}
              onChange={(value) => handleSettingChange('vits_model', value)}
              placeholder="Enter VITS Model Path"
            />
            <InputField
              label="VITS Lexicon"
              value={(modelConfig as SherpaOnnxTTSConfig).vits_lexicon || ''}
              onChange={(value) => handleSettingChange('vits_lexicon', value)}
              placeholder="Enter VITS Lexicon Path"
            />
            <InputField
              label="VITS Tokens"
              value={(modelConfig as SherpaOnnxTTSConfig).vits_tokens || ''}
              onChange={(value) => handleSettingChange('vits_tokens', value)}
              placeholder="Enter VITS Tokens Path"
            />
            <InputField
              label="VITS Data Directory"
              value={(modelConfig as SherpaOnnxTTSConfig).vits_data_dir || ''}
              onChange={(value) => handleSettingChange('vits_data_dir', value)}
              placeholder="Enter VITS Data Directory"
            />
            <InputField
              label="VITS Dict Directory"
              value={(modelConfig as SherpaOnnxTTSConfig).vits_dict_dir || ''}
              onChange={(value) => handleSettingChange('vits_dict_dir', value)}
              placeholder="Enter VITS Dict Directory"
            />
            <InputField
              label="TTS Rule FSTs"
              value={(modelConfig as SherpaOnnxTTSConfig).tts_rule_fsts || ''}
              onChange={(value) => handleSettingChange('tts_rule_fsts', value)}
              placeholder="Enter TTS Rule FSTs Path"
            />
            <InputField
              label="Max Sentences"
              value={String((modelConfig as SherpaOnnxTTSConfig).max_num_sentences) || '2'}
              onChange={(value) => handleSettingChange('max_num_sentences', parseInt(value))}
              placeholder="Enter Max Number of Sentences"
            />
            <InputField
              label="Speaker ID"
              value={String((modelConfig as SherpaOnnxTTSConfig).sid) || '1'}
              onChange={(value) => handleSettingChange('sid', parseInt(value))}
              placeholder="Enter Speaker ID"
            />
            <InputField
              label="Provider"
              value={(modelConfig as SherpaOnnxTTSConfig).provider || 'cpu'}
              onChange={(value) => handleSettingChange('provider', value)}
              placeholder="Enter Provider (cpu/cuda/coreml)"
            />
            <InputField
              label="Threads"
              value={String((modelConfig as SherpaOnnxTTSConfig).num_threads) || '1'}
              onChange={(value) => handleSettingChange('num_threads', parseInt(value))}
              placeholder="Enter Number of Threads"
            />
            <InputField
              label="Speed"
              value={String((modelConfig as SherpaOnnxTTSConfig).speed) || '1.0'}
              onChange={(value) => handleSettingChange('speed', parseFloat(value))}
              placeholder="Enter Speed"
            />
            <InputField
              label="Debug"
              value={String((modelConfig as SherpaOnnxTTSConfig).debug) || 'false'}
              onChange={(value) => handleSettingChange('debug', value === 'true')}
              placeholder="Enter Debug Mode (true/false)"
            />
          </>
        );

      default:
        return null;
    }
  };

  const ttsModels = createListCollection({
    items: availableModels.map((model) => ({
      label: model,
      value: model,
    })),
  });

  return (
    <Stack {...settingStyles.common.container}>
      <SelectField
        label="TTS Model"
        value={[pendingSettings.tts_model]}
        onChange={(value) => handleSettingChange('tts_model', value[0])}
        collection={ttsModels}
        placeholder="Select TTS model"
      />
      {renderModelConfig()}
    </Stack>
  );
}

export default TTS;
