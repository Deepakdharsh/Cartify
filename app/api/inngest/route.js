import { deleteCouponOnExpiry, syncUserCreation, syncUserDeletion, syncUserUpdation } from '@/inngest/functions.js'
import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client.js'

// create an API that server zero functions
export const {GET,POST,PUT} = serve({client:inngest,
    functions:[
        /* your functions will be passed here later! */
        syncUserCreation,
        syncUserUpdation,
        syncUserDeletion,
        deleteCouponOnExpiry
    ]
})