export const colors = {
  paper: '#fbfaee',
  ink: '#44443f',
  inkSoft: 'rgba(68, 68, 63, 0.45)',
  line: 'rgba(68, 68, 63, 0.12)',
} as const;

export const space = {
  page: 32,
  metaGap: 10,
  iconGap: 12,
} as const;

export const type = {
  browse: {
    fontSize: 12,
    lineHeight: 17,
  },
  meta: {
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    lineHeight: 30,
  },
} as const;

export const metaText = {
  color: colors.ink,
  fontFamily: 'NotoSerifKR_500Medium',
  fontSize: type.meta.fontSize,
  lineHeight: type.meta.lineHeight,
  height: type.meta.lineHeight,
  includeFontPadding: false,
  textAlignVertical: 'center' as const,
  padding: 0,
  margin: 0,
};
