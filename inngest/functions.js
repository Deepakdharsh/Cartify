import {inngest} from "./client.js"
import prisma from "../lib/prisma.js";

// Inngest function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    /* {id:"sync-user-create"},
    {event:"clerk/user.created"}, */
    {id:"gocart-ecommerce-sync-user-create"},{
      triggers:[
        {event:"clerk/user.created"}
      ]  
    },
    async ({event, step}) => {
        const {data} = event;
        await prisma.user.create({data:{
            id: data.id,
            email:data.email_addresses[0].email_address,
            name:`${data.first_name} ${data.last_name}`,
            image:data.image_url
        }})
    }
)        

// Inngest function to update user data in a database

export const syncUserUpdation = inngest.createFunction(
   /*  {id:"sync-user-update"},
    {event:"clerk/user.updated"}, */
    {id:"gocart-ecommerce-sync-user-update"},{
      triggers:[
        {event:"clerk/user.updated" },
      ]
    },
    async ({event, step}) => {  
        const {data} = event;
        await prisma.user.update({
            where:{id:data.id},
            data:{
                email:data.email_addresses[0].email_address,
                name:`${data.first_name} ${data.last_name}`,
                image:data.image_url    
            }
        })
    }
)

// Inngest function to delete user data from a database

export const syncUserDeletion = inngest.createFunction(
    /* {id:"sync-user-deletion"},
    {event:"clerk/user.deleted"}, */
    {id:"gocart-ecommerce-sync-user-deletion"},{
        triggers:[
            {event:"clerk/user.deleted" },
        ]
    },
    async ({event, step}) => {  
        const {data} = event;
        await prisma.user.delete({
            where:{id:data.id}
        })
    }
)
