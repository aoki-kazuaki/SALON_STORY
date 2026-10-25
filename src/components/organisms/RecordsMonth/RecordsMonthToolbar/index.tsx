import { ChevronsDownUpIcon, ChevronsUpDownIcon } from "lucide-react";

import CButton from "@/components/atoms/CButton";

/** RecordsMonthToolbar の Props */
type Props = {
  /** 「全て開く (入力済)」押下時に呼ばれる */
  onExpandFilled: () => void;
  /** 「全て閉じる」押下時に呼ばれる */
  onCollapseAll: () => void;
};

/** 月別一覧の一括操作バー */
const RecordsMonthToolbar = ({ onExpandFilled, onCollapseAll }: Props) => (
  <>
    <CButton variant="outline" size="sm" onClick={onExpandFilled}>
      <ChevronsUpDownIcon />
      全て開く (入力済)
    </CButton>
    <CButton variant="outline" size="sm" onClick={onCollapseAll}>
      <ChevronsDownUpIcon />
      全て閉じる
    </CButton>
  </>
);

export default RecordsMonthToolbar;
