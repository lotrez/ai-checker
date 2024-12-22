import { useState } from "react";
import Viewer from "~/components/editor/viewer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/editor";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "AI Text Checker" },
		{
			name: "description",
			content:
				"Check your text for errors, plagiarism or badly worded sentences.",
		},
	];
}

export default function Editor() {
	const [text, setText] = useState(DEFAULT_TEXT);
	return (
		<div className="grid gap-4 grid-cols-2 mx-auto w-full md:max-w-[1200px] mt-12">
			<Card className="flex flex-col">
				<CardHeader>
					<CardTitle>Edit your text</CardTitle>
				</CardHeader>
				<CardContent className="flex-1">
					<Textarea
						value={text}
						className="min-h-[500px] h-full"
						onChange={(v) => setText(v.currentTarget.value)}
					/>
				</CardContent>
			</Card>

			<Viewer text={text} />
		</div>
	);
}

const DEFAULT_TEXT = `
C’est suite à l’ascension de l’histoire sociale que les historiens se questionnent par rapport au rôle de la femme dans l’histoire. Ce mouvement permet de redonner une voix aux groupes marginalisés et à comprendre les dynamiques de pouvoir. Olympe de Gouges apparaît alors au cœur du mouvement. Même si la femme est étudiée davantage, elle reste moins étudiée que les hommes.
Concernant la littérature du 20e, certains écrivains revisitent ses écrits. Des biographies et des études littéraires vont mettre en avant ses pièces de théâtre et ses écrits politiques. Le premier roman qui paraît sur Olympe de Gouges est celui de Geneviève Chauvel en 1989, Olympe.

Au milieu du 20e siècle, avec la montée du féminisme (1960-1970) les femmes sont encore plus étudiées et Olympe de Gouges a été découverte comme une pionnière du féminisme. Les historiens commencent à parler de “révolutionnaire” mais aussi d’une femme qui est en avance sur son temps grâce à ses idées, notamment celle de l’égalité des sexes.

Aujourd’hui, Olympe de Gouges reste une figure emblématique lorsqu’on parle de la Révolution française. Elle n’est pas seulement vue comme une révolutionnaire, mais comme une intellectuelle qui a permis de faire avancer les débats sur l’égalité des droits. Elle est également au centre de l’histoire quand on parle de la Révolution Française. Aujourd’hui, alors qu’il y a de nombreuses études sur les femmes et la révolution, ses œuvres font partie du patrimoine littéraire. L'intérêt pour ses œuvres montre une volonté de revaloriser le rôle des femmes dans les grands moments de l’histoire. Olympe de Gouges (Casterman, 2012), est une bande-dessinée illustrée par Catel et Jean-Louis Bocquet, qui explore de façon accessible et visuelle son rôle pendant la Révolution française.
Son image est parfois utilisée pour incarner la lutte des femmes pour leurs droits et la justice sociale. Des œuvres contemporaines retracent sa vie et ses écrits, et elle est devenue un symbole fort de la lutte pour les droits civils et sociaux des femmes. Olympe de Gouges, porteuse d'espoir (2023) est un court-métrage récent évoquant ses luttes féministes et politiques.

`;
