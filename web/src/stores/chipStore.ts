import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChipDefinition, PinCapability } from '@/types/chip'

export const useChipStore = defineStore('chip', () => {
  // State
  const currentChip = ref<ChipDefinition | null>(null)
  const pinConfigurations = ref<Record<string, string>>({}) // Key: PinName, Value: SelectedFunction
  const isLoaded = computed(() => !!currentChip.value)

  // Actions
  function loadChip(data: ChipDefinition) {
    currentChip.value = data
    pinConfigurations.value = {} // 重置配置
  }

  function setPinFunction(pinName: string, func: string) {
    if (!currentChip.value) return
    
    // 如果选择的是默认功能或空，则移除配置
    if (!func) {
      const { [pinName]: _, ...rest } = pinConfigurations.value
      pinConfigurations.value = rest
      return
    }

    // 检查该引脚是否支持该功能
    const supported = getPinFunctions(pinName)
    if (supported.includes(func)) {
      pinConfigurations.value = {
        ...pinConfigurations.value,
        [pinName]: func
      }
    }
  }

  function getPinConfiguration(pinName: string): string | undefined {
    return pinConfigurations.value[pinName]
  }

  /**
   * 根据引脚名称获取引脚能力定义
   * @param pinName 引脚名称 (如 "PA1")
   */
  function getPinFunctions(pinName: string): string[] {
    if (!currentChip.value) return []
    const pin = currentChip.value.pins[pinName]
    return pin ? pin.functions : []
  }

  /**
   * 获取引脚的类型（gpio/power/reset等）
   */
  function getPinType(pinName: string): string {
    if (!currentChip.value) return 'unknown'
    const pin = currentChip.value.pins[pinName]
    return pin ? pin.type : 'unknown'
  }

  /**
   * 获取物理引脚信息（编号和名称）
   */
  const physicalPins = computed(() => {
    if (!currentChip.value) return []
    return currentChip.value.package.pins
  })

  return {
    currentChip,
    isLoaded,
    physicalPins,
    pinConfigurations,
    loadChip,
    getPinFunctions,
    getPinType,
    setPinFunction,
    getPinConfiguration
  }
})
