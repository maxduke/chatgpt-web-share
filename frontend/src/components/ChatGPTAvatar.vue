<template>
  <n-avatar :color="color" :size="size" :class="props.alpha ? [`opacity-${props.alpha}`] : []">
    <ChatGPTIcon v-if="iconStyle == 'default'" :size="48" />
  </n-avatar>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { getChatModelColor, getChatModelIconStyle } from '@/utils/chat';

import ChatGPTIcon from './ChatGPTIcon.vue';

const props = defineProps<{
  model?: string | null;
  iconStyle?: string;
  color?: string;
  alpha?: number;
  size?: any;
}>();

const size = computed(() => {
  if (props.size) {
    return props.size;
  }
  return 'large';
});

const iconStyle = computed(() => {
  if (props.model) {
    return getChatModelIconStyle(props.model);
  }
  return props.iconStyle || 'default';
});

const colorMap = {
  green: '#10A37F',
  black: '#000000',
  purple: '#ab68ff',
  lightblue: '#9ECBFB',
  darkblue: '#2F94FF',
  darkgreen: '#0E7C7B',
  darkpurple: '#6F2C91',
  red: '#FF0000',
  darkred: '#840000',
};

const color = computed(() => {
  let result = '';
  if (props.color && colorMap[props.color as keyof typeof colorMap] != undefined) {
    result = colorMap[props.color as keyof typeof colorMap];
  } else if (props.color) {
    result = props.color;
  } else if (props.model) {
    const colorName = getChatModelColor(props.model);
    result = colorMap[colorName as keyof typeof colorMap];
  } else {
    result = colorMap.green;
  }
  // 先将 #xxxxxx 格式的 result 转换成 rgb 格式，再根据 opacity，将 result 改写为 rgba 形式。
  if (props.alpha && result.startsWith('#')) {
    const hex = result.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    result = `rgba(${r}, ${g}, ${b}, ${props.alpha || 100})`;
  }

  return result;
});
</script>
