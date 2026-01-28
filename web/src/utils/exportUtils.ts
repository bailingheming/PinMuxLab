import type { ChipDefinition } from '@/types/chip'

export function exportConfigurationToCSV(
  chip: ChipDefinition,
  configurations: Record<string, string>
) {
  // CSV Header
  const headers = ['Pin Name', 'Physical Number', 'Type', 'Configured Function']
  const rows: string[] = []

  rows.push(headers.join(','))

  // 遍历所有物理引脚，确保顺序（按物理编号排序可能更好，或者按引脚名）
  // 这里我们按物理编号排序
  const sortedPins = chip.package.pins.sort((a, b) => {
    // 尝试提取数字部分进行排序， fallback 到字符串比较
    const numA = parseInt(a.number)
    const numB = parseInt(b.number)
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }
    return a.number.localeCompare(b.number)
  })

  for (const pin of sortedPins) {
    const pinName = pin.name
    const pinNumber = pin.number
    const pinType = chip.pins[pinName]?.type || 'unknown'
    const configuredFunc = configurations[pinName] || '' // 如果没配置留空

    // 只有当用户配置了功能，或者你想导出所有引脚时。
    // 通常导出 CSV 是为了生成 BOM 或代码，导出所有引脚状态比较好。
    
    // CSV 转义处理 (简单处理逗号)
    const row = [
      pinName,
      pinNumber,
      pinType,
      configuredFunc
    ].map(field => {
      const str = String(field)
      return str.includes(',') ? `"${str}"` : str
    })

    rows.push(row.join(','))
  }

  // 生成 Blob
  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  
  // 文件名: ChipName_PinMux_Timestamp.csv
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `${chip.meta.name}_PinMux_${timestamp}.csv`
  link.setAttribute('download', filename)
  
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
