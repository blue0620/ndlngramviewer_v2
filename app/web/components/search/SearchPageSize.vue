<template>
  <div class="search-pagesize is-size-7">
    <div class="select">
      <select :value="modelValue" @input="sizeChange">
        <option v-for="v in values" :key="v" :value="v">{{ v }}件</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  manual?: boolean
  modelValue: number
  keyword?: string
}

const props = withDefaults(defineProps<Props>(), {
  manual: false,
  keyword: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const router = useRouter()
const values = ['100', '200', '500']


const sizeChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  const nextSize = Number(target?.value ?? props.modelValue)
  emit('update:modelValue', nextSize)

  await router.push({
    query: {
      keyword: props.keyword,
      size: String(nextSize)
    }
  })
}
</script>
