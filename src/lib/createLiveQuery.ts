import { watch, ref, Ref,shallowRef, reactive, shallowReactive, UnwrapRef} from 'vue'
import { QualifiedTablename, hasIntersection } from 'electric-sql/util'
import { Notifier } from 'electric-sql/notifiers'


export interface LiveResultContext<T> {
    (): Promise<LiveResult<T>>
    sourceQuery?: Record<string, any> | undefined
  }
  
  /**
   * A live result wrapping the `result` as well as the concerned table names.
   * The table names are used to subscribe to changes to those tables
   * in order to re-run the live query when one of the tables change.
   */
  export class LiveResult<T> {
    constructor(public result: T, public tablenames: QualifiedTablename[]) { }
  }
  



export function createLiveQuery<T>(notifier:Notifier,query:Ref<LiveResultContext<T>>) {

    const result = reactive<{value:T|undefined}>({value:undefined})
    watch(
        query,
        (q, _) => {
            let tablenames:QualifiedTablename[]
            q().then(
                r => {
                    tablenames = r.tablenames
                    result.value = r.result
                    notifier.subscribeToDataChanges(
                        n => {
                            if (hasIntersection(tablenames, notifier.alias(n))) {
                                q().then(r => result.value = r.result)

                            }
                        }
                    )
                }
            )
        },
        { immediate: true }
    )
    return result
}
