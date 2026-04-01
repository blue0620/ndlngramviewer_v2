<script setup lang="ts">
const route = useRoute()
await navigateTo({
  path: '/',
  query: route.query,
}, { redirectCode: 308 })
</script>
