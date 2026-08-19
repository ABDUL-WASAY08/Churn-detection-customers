import { create } from "zustand";
import { Api } from "../Services/axios";

export const trainDataStore = create((set) => ({
  dataUrl: "",
  loading: false,
  error: null,
  response: null,

  // Health state
  health: null,
  healthLoading: false,

  status: null,
  statusLoading: false,
  tree: null,
  treeLoading: false,
  getHealth: async () => {
    try {
      set({ healthLoading: true, error: null });
      const response = await Api.get("/health");
      set({ health: response.status, healthLoading: false });
    } catch {
      set({ health: null, healthLoading: false });
    }
  },

  // -------------------------
  // Start training
  // -------------------------
  startTraining: async (dataUrl) => {
    if (!dataUrl.trim()) {
      set({ error: "Please enter a valid URL", loading: false });
      return;
    }

    set({
      dataUrl,
      loading: true,
      error: null,
      response: null,
      status: null,
      tree: null,
    });

    try {
      const response = await Api.post("/train", {
        data_url: dataUrl,
      });

      set({ response: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
    }
  },

  // -------------------------
  // Fetch live training status
  // -------------------------
  getStatus: async () => {
    try {
      set({ statusLoading: true });
      const response = await Api.get("/status");
      set({ status: response.data?.data ?? null, statusLoading: false });
      return response.data?.data ?? null;
    } catch (error) {
      set({
        statusLoading: false,
        error: error.response?.data?.message || error.message,
      });
      return null;
    }
  },

  // -------------------------
  // Fetch decision tree JSON
  // -------------------------
  getTree: async () => {
    try {
      set({ treeLoading: true });
      const response = await Api.get("/tree");
      set({ tree: response.data?.data ?? null, treeLoading: false });
      return response.data?.data ?? null;
    } catch (error) {
      set({
        treeLoading: false,
        error: error.response?.data?.message || error.message,
      });
      return null;
    }
  },
}));