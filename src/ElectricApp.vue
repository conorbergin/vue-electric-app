<script setup lang="ts">
import { initElectric } from './init';
import { ref, computed} from 'vue'
import { genUUID } from 'electric-sql/util'
import { generateRandomName, generateRandomValue } from './utils';
import {createLiveQuery, createDerivedQuery} from './lib/createLiveQuery'





const electric = await initElectric()
const {notifier,db} = electric
db.person.sync()

const add = () => {
    db.person.create({
        data: {
            id: genUUID(),
            name: generateRandomName(),
            age: generateRandomValue()
        }
    })
}

const clear = () => db.person.deleteMany()

const change = () => db.person.findFirst().then(p => 
                 p && db.person.update({where:{id:p.id},data:{age:5}}))



const search = ref("")
const query = computed(() => db.person.liveMany({ where: { name: { contains: search.value } } }));

const items = createDerivedQuery(notifier,query)

</script>


<template>
    <button @click="add">Add</button>
    <button @click="clear">Clear</button>
    <button @click="change">Change</button>
    <br>
    <input v-model="search" placeholder="search"/>
    <div v-if="items">
        <div v-for="item in items.value">{{ item.name }} {{ item.age }}</div>
    </div>
</template>