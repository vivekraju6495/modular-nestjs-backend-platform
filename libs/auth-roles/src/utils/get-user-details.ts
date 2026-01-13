import { User } from "@app/auth/entities/user.entity";
import { Repository } from "typeorm";

/**
 * Fetches user details by user ID.
 * @param userId - The ID of the user.
 * @param userRepo - The User repository instance.
 */
export async function getUserDetails(
    userId: string,
    userRepo: Repository<User>
): Promise<User | undefined | null> {
    const userDetails = await userRepo.findOne({ where: { uuid: userId } });
    if (!userDetails) {
      return undefined;    
    }
    return userDetails;
}