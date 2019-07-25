<template>
<div>
    <div class="nav-breadcrumb-wrap">
        <div class="container">
          <nav class="nav-breadcrumb">
            <a href="/">Home</a>
            <!-- 插槽 -->
            <slot name="bread"></slot>
          </nav>
        </div>
      </div>
      
</div>
</template>
<script>
export default {
    name:'NavBread'
}
</script>

