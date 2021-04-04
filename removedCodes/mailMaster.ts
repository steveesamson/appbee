import raa from "../src/common/utils/handleAsyncAwait";
import { DataSources } from "../src/common/utils/dataSource";
import { Models } from "../src/common/utils/storeModels";
import { MailMasterType } from "../src/common/types";

const MailMaster: MailMasterType = (_db: string, messanger: any) => {
	if (!DataSources[_db]) return { start: () => false };

	const _req: any = { db: DataSources[_db] },
		Mails = Models.getMails(_req),
		fetchMails = async () => {
			return await raa(Mails.find({ limit: 100 }));
		},
		dispatch = (recs: any) => {
			const run = () => {
					if (recs.length) {
						sendMail(recs.pop());
					} else setTimeout(start, 100);
				},
				sendMail = (r: any) => {
					r.to = `${r.receiver_name} <${r.receiver_email}>`;
					r.message = r.body;

					messanger.sendMail(r);
					Mails.destroy({ id: r.id });
					run();
				};

			run();
		},
		start = async () => {
			const { data: mails, error } = await fetchMails();
			if (error) {
				return console.error(error);
			}
			dispatch(mails);
		};

	console.log("Registered Mailer for ", _db);

	return {
		start: start,
	};
};

export default MailMaster;
