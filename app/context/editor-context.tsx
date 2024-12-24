import { type ReactNode, createContext, useState } from "react";

interface EditorContext {
	text: string;
	setText: (text: string) => void;
}

export const EditorContext = createContext({} as EditorContext);

export default function EditorContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [text, setText] = useState(DEFAULT_TEXT);
	return (
		<EditorContext.Provider
			value={{
				setText,
				text,
			}}
		>
			{children}
		</EditorContext.Provider>
	);
}

const DEFAULT_TEXT = `
Bonjour, je m'appelle Lucien.

Caca pipi

This story shows how women of Bird’s time could break barriers and explore new worlds, even if society tried to limit them. This book is also a recall of what was like in the 19e century. As it is full of details, we can easily feel what it was like to be in her shoes. Her relationship with Jim, a rugged and complex man, adds emotional depth to the narrative. 
In the excerpt I choose to work on (pages 240 - 247 of Letter XVI), Isabella Bird is still in the Rocky Mountains and she faced difficulties like crossing rough terrain and dangerous weather. By this point, Bird is near the end of her adventure in the mountains and is reflecting on everything she’s experienced, especially her relationship with Mountain Jim.

`;
