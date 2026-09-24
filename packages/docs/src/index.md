---
title: Act-Master — Frontend Action Architecture for Vue & React
description: A frontend-way to separate business logic from application view. Build clean, testable, type-safe applications with action-based pub/sub architecture.
head:
  - - meta
    - name: description
      content: A frontend-way to separate business logic from application view. Build clean, testable, type-safe applications with action-based pub/sub architecture.
  - - meta
    - name: keywords
      content: act-master, vue, react, typescript, frontend architecture, business logic, pub/sub, actions, dependency injection, state management, testing
  - - meta
    - property: og:title
      content: Act-Master — Frontend Action Architecture for Vue & React
  - - meta
    - property: og:description
      content: A frontend-way to separate business logic from application view. Build clean, testable, type-safe applications with action-based pub/sub architecture.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/
  - - script
    - type: application/ld+json
    - '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Act-Master","applicationCategory":"DeveloperApplication","operatingSystem":"Any","description":"A frontend-way to separate business logic from application view.","url":"https://avil13.github.io/act-master/","codeRepository":"https://github.com/avil13/act-master","programmingLanguage":"TypeScript"}'

sidebar: false
aside: false

# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Act-Master'
  text: Simplifying Frontend Application Development
  tagline: A frontend-way to separate business logic from application view.
  image:
    src: /assets/act-master-logo.svg
    alt: Act-Master logo — action-based frontend architecture framework for Vue and React
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: ActMasterAction
      link: /guide/act-master-action
    - theme: alt
      text: CLI
      link: /guide/cli
    - theme: alt
      text: AI Agent Skill
      link: /act-master/llm.txt
      target: _blank

features:
  - title: Commander
    details: Separate logic from view.
  - title: Pub/Sub
    details: We always work with up-to-date data.
  - title: Type Safe
    details: Write simple, safe, and testable code.
---

## One action, two components

Imagine a profile form and a header that displays the user's name. When the user saves the form, the header should show the updated name too.

With Act-Master, the form **calls an action**, the action **saves the profile**, and the header **receives the result**.

### 1. Put the save logic in an action

Here, `profileApi` is your application's API client. Its `save` method returns the saved `Profile`, a type with `id: string` and `name: string`.

```ts
// src/act/SaveProfile.act.ts
import type { ActMasterAction } from 'act-master';
import { profileApi, type Profile } from '@/services/profile-api';

export class SaveProfile implements ActMasterAction {
  readonly name = 'SaveProfile';

  async exec(profile: Profile): Promise<Profile> {
    return profileApi.save({ ...profile, name: profile.name.trim() });
  }
}
```

::: details Register the action once when the app starts
Install with `npm install act-master`, then register the action before mounting your Vue app:

```ts
// src/main.ts
import { createApp } from 'vue';
import { VueActMaster } from 'act-master/vue';
import App from './App.vue';
import { SaveProfile } from '@/act/SaveProfile.act';

createApp(App)
  .use(VueActMaster, { actions: [new SaveProfile()] })
  .mount('#app');
```

For larger projects, the [CLI](/guide/cli) generates the actions registry and call types for you.
:::

### 2. Call it when the form is submitted

```ts
import { act } from 'act-master';

// In the profile form's submit handler:
await act().exec('SaveProfile', { id: '42', name: ' Ada ' });
```

The action trims the name and saves it. The caller receives the saved profile; subscribers receive the same result after the save succeeds. Handle a rejected call in the form or configure an [error-handler action](/guide/act-master-action#onerror).

### 3. Let the header react to the saved profile

```vue
<!-- ProfileHeader.vue -->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { act } from 'act-master';
import type { Profile } from '@/services/profile-api';

const name = ref('');

act().on('SaveProfile', (profile: Profile) => {
  name.value = profile.name;
}, onBeforeUnmount);
</script>

<template>
  <span>{{ name }}</span>
</template>
```

Mount the header before submitting the form. It listens for future successful saves and unsubscribes automatically when it unmounts. After this save, it displays **Ada**.

The form and header can evolve independently. Any screen can reuse `SaveProfile`, and you can test its save logic with a fake API client without rendering a component. Each component stays focused on its own UI.

[Get started with Act-Master →](/guide/installation)
