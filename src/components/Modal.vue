<template>
  <div>
    <div
      class="md-modal modal--msg md-modal-transition md-show"
      v-if="mdShow"
    >
      <div class="md-modal-inner">
        <div class="md-top">
          <button
            class="md-close"
            @click="closeModal"
          >Close</button>
        </div>

        <div class="md-content">
          <div class="confirm-tips">
            <slot name="message"></slot>

          </div>
          <div class="confirm-tips">
            <slot name="btnGroup"></slot>
          </div>
        </div>
      </div>
    </div>
    <div
      class="md-overlay"
      v-if="mdShow"
      @click="closeModal"
    ></div>
  </div>
</template>
<script>
export default {
  name: "NavHeader",
  props: ["mdShow"],
  data() {
    return {
      msg: "hellow world"
    };
  },
  methods: {
      closeModal(){
          this.$emit("close");
        //   trigger('click')
      }
  }
};
</script>
<style scoped>
 .btn-wrap{
     height: 40px;
 }
</style>

