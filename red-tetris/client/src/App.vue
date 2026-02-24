<script setup>
import { onMounted } from "vue"
import { socket } from "./net/socket"

onMounted(() => {
  socket.on("connect", () => {
    console.log("Connected to server:", socket.id)
  })
})
</script>

<template>
  <div>
    <h1>Red Tetris</h1>
    <p>Open console (F12) to check connection</p>
  </div>
</template>