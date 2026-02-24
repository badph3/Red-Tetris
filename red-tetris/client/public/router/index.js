import { createRouter, createWebHistory } from "vue-router";
import LobbyView from "../views/LobbyView.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/:room/:player",
      name: "Lobby",
      component: LobbyView
    }
  ]
});