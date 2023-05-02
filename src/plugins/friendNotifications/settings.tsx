/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/settings";
import { OptionType } from "@utils/types";
import { Button, UserStore, useState } from "@webpack/common";
import User from "discord-types/general/User";

import { tracked, writeTrackedToDataStore } from "./utils";

export default definePluginSettings({
    notifications: {
        type: OptionType.BOOLEAN,
        description: "Sends OS/ Vencord notification when someone comes online",
        default: true
    },
    offlineNotifications: {
        type: OptionType.BOOLEAN,
        description: "Notifies you when a friend goes offline",
        default: false
    },
    onlineNotifications: {
        type: OptionType.BOOLEAN,
        description: "Notifies you when a friend comes online",
        default: true
    },
    tracking: {
        type: OptionType.COMPONENT,
        description: "People that should be tracked",
        component: () => {
            // Use useState to force a re-render on update to underlying data
            // TODO find something more elegant
            const [_count, setCount] = useState(0);

            const ids = Array.from(tracked.keys());
            // If they aren't a friend, you cannot access this data.
            // Therefore a check has to be done and data has to be cleaned
            const users = ids
                .reduce((acc, curId) => {
                    const user = UserStore.getUser(curId);
                    // If user is ok, then ignore
                    if (typeof user !== "undefined") {
                        return acc.concat(user);
                    }

                    // If user object doesn't exist, remove
                    tracked.delete(curId);
                    return acc;
                }, [] as User[]);

            if (users.length === 0) {
                return <span style={{
                    color: "var(--text-muted)"
                }}>You don't have anyone added to your friend notifications</span>;
            }

            return <div> {
                users.map(user => {
                    return <div key={user.id} style={{
                        display: "flex",
                        height: "100%",
                        color: "var(--text-default)",
                        width: "75%",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "1rem",
                        background: "var(--background-floating)",
                        borderRadius: "5px",
                        margin: "0.5rem auto",
                        padding: "0.5rem 2rem"
                    }}>
                        <span>
                            {user.username}<span style={{
                                color: "var(--text-muted)"
                            }}>
                                #{user.discriminator}
                            </span>
                        </span>
                        <Button style={{ cursor: "pointer" }} onClick={async () => {
                            tracked.delete(user.id);
                            // Persist data
                            await writeTrackedToDataStore();

                            // Force re-render
                            setCount(c => c + 1);
                        }}>
                            DELETE
                        </Button>
                    </div>;
                })
            }</div>;
        }
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: "Adds debug information (recommended is keeping this disabled unless you know what you're doing)",
        default: false
    },
});
