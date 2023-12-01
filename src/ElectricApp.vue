<script setup lang="ts">
import { initElectric } from './init';
import { Electric } from './generated/client/index'
import { ref, computed, reactive, watchEffect, watch } from 'vue'
import { genUUID, hasIntersection } from 'electric-sql/util'
import { isTemplateExpression } from 'typescript';
import { generateRandomName, generateRandomValue } from './utils';





const electric = await initElectric()
electric.db.person.sync()

const add = () => {
    electric.db.person.create({
        data: {
            id: genUUID(),
            name: generateRandomName(),
            age: generateRandomValue()
        }
    })
}

const search = ref("")
const query = computed(() => electric.db.person.liveMany({ where: { name: { contains: search.value } } }));

const items = ref([])

watch(
    query,
    (q, _) => {
        let tablenames = []
        q().then(
            r => {
                tablenames = r.tablenames
                items.value = r.result
                electric.notifier.subscribeToDataChanges(
                    n => {
                        if (hasIntersection(tablenames, electric.notifier.alias(n))) {
                            q().then(r => items.value = r.result)

                        }
                    }
                )
            }
        )
    },
    {immediate: true}
)


</script>


<template>
    <button @click="add">Add</button>
    <input v-model="search" />
    <div v-for="item in items">{{ item.name }}</div>
</template>