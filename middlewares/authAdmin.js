import { clerkClient } from "@clerk/nextjs/dist/types/server"


export async function authAdmin(userId) {
    try {
        if(!userId) return false

        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        return process.env.ADMIN_EMAIL.split(",").includes(user.emailAddresses[0].emailAddress)
    } catch (error) {
        console.error(error)
        return false
    }
}