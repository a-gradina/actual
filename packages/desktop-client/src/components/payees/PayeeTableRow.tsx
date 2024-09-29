// @ts-strict-ignore
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type PayeeEntity } from 'loot-core/src/types/models';

import { useSelectedDispatch } from '../../hooks/useSelected';
import { SvgArrowThinRight, SvgBookmark } from '../../icons/v1';
import { type CSSProperties, theme } from '../../style';
import { Text } from '../common/Text';
import {
  Cell,
  CellButton,
  CustomCell,
  InputCell,
  Row,
  SelectCell,
} from '../table';

type RuleButtonProps = {
  count: number;
  focused: boolean;
  onEdit: () => void;
  onClick: () => void;
};

function RuleButton({ count, focused, onEdit, onClick }: RuleButtonProps) {
  return (
    <Cell
      name="rule-count"
      width="auto"
      focused={focused}
      style={{ padding: '0 10px' }}
      plain
    >
      <CellButton
        style={{
          borderRadius: 4,
          padding: '3px 6px',
          backgroundColor: theme.noticeBackground,
          border: '1px solid ' + theme.noticeBackground,
          color: theme.noticeTextDark,
          fontSize: 12,
        }}
        onEdit={onEdit}
        onSelect={onClick}
      >
        <Text style={{ paddingRight: 5 }}>
          {count > 0 ? (
            <Trans count={count}>{{ count }} associated rules</Trans>
          ) : (
            <Trans>Create rule</Trans>
          )}
        </Text>
        <SvgArrowThinRight style={{ width: 8, height: 8 }} />
      </CellButton>
    </Cell>
  );
}

type EditablePayeeFields = keyof Pick<PayeeEntity, 'name' | 'favorite'>;

type PayeeTableRowProps = {
  payee: PayeeEntity;
  ruleCount: number;
  selected: boolean;
  hovered: boolean;
  editing: boolean;
  focusedField: string;
  onHover?: (id: PayeeEntity['id']) => void;
  onEdit: (id: PayeeEntity['id'], field: string) => void;
  onUpdate: (
    id: PayeeEntity['id'],
    field: EditablePayeeFields,
    value: unknown,
  ) => void;
  onViewRules: (id: PayeeEntity['id']) => void;
  onCreateRule: (id: PayeeEntity['id']) => void;
  style?: CSSProperties;
};

export const PayeeTableRow = memo(
  ({
    payee,
    ruleCount,
    selected,
    hovered,
    editing,
    focusedField,
    onViewRules,
    onCreateRule,
    onHover,
    onEdit,
    onUpdate,
    style,
  }: PayeeTableRowProps) => {
    const { t } = useTranslation();

    const { id } = payee;
    const dispatchSelected = useSelectedDispatch();
    const borderColor = selected
      ? theme.tableBorderSelected
      : theme.tableBorder;
    const backgroundFocus = hovered || focusedField === 'select';

    return (
      <Row
        style={{
          alignItems: 'stretch',
          ...style,
          borderColor,
          backgroundColor: hovered
            ? theme.tableRowBackgroundHover
            : selected
              ? theme.tableRowBackgroundHighlight
              : backgroundFocus
                ? theme.tableRowBackgroundHover
                : theme.tableBackground,
          ...(selected && {
            backgroundColor: theme.tableRowBackgroundHighlight,
            zIndex: 100,
          }),
        }}
        data-focus-key={payee.id}
        onMouseEnter={() => onHover && onHover(payee.id)}
      >
        <SelectCell
          exposed={
            payee.transfer_acct == null && (hovered || selected || editing)
          }
          focused={focusedField === 'select'}
          selected={selected}
          onSelect={e => {
            dispatchSelected({
              type: 'select',
              id: payee.id,
              isRangeSelect: e.shiftKey,
            });
          }}
        />
        <CustomCell
          width={10}
          exposed={!payee.transfer_acct}
          onBlur={() => {}}
          onUpdate={() => {}}
          onClick={() => {}}
        >
          {() => {
            if (payee.favorite) {
              return <SvgBookmark />;
            } else {
              return;
            }
          }}
        </CustomCell>
        <InputCell
          value={(payee.transfer_acct ? t('Transfer: ') : '') + payee.name}
          valueStyle={
            (!selected &&
              payee.transfer_acct && { color: theme.pageTextSubdued }) ||
            (!selected && !payee.transfer_acct && { color: theme.tableText }) ||
            (selected && { color: theme.tableTextSelected })
          }
          exposed={focusedField === 'name'}
          width="flex"
          onUpdate={value =>
            !payee.transfer_acct && onUpdate(id, 'name', value)
          }
          onExpose={() => onEdit(id, 'name')}
          inputProps={{ readOnly: !!payee.transfer_acct }}
        />
        <RuleButton
          count={ruleCount}
          focused={focusedField === 'rule-count'}
          onEdit={() => onEdit(id, 'rule-count')}
          onClick={() =>
            ruleCount > 0 ? onViewRules(payee.id) : onCreateRule(payee.id)
          }
        />
      </Row>
    );
  },
);

PayeeTableRow.displayName = 'PayeeTableRow';
