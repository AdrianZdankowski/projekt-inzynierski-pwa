import { useMemo } from 'react';
import { Breadcrumbs, useMediaQuery } from '@mui/material';
import Chip from '@mui/material/Chip';
import { styled, useTheme } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface FileBreadcrumbsProps {
  items: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
}

const StyledBreadcrumb = styled(Chip)(() => ({
  height: '30px',
  borderRadius: '18px',
  fontWeight: '600px',
  paddingInline: '2px',
  '& .MuiChip-icon': {
    marginLeft: '8px',
  },
  '& .MuiChip-label': {
    fontSize: '0.8rem',
    marginTop: '2px',
  },
}));

const FileBreadcrumbs = ({ items, onBreadcrumbClick }: FileBreadcrumbsProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const maxItems = isTablet ? 2 : 5;

  const visibleItems = useMemo(
    () => {
      if (!items.length) return [];

      if (items.length <= maxItems) {
        return items.map((item, index) => ({
          item,
          originalIndex: index,
        }));
      }

      const tailCount = maxItems - 1;
      const tail = items.slice(-tailCount);

      return [
        {
          item: { id: null, name: '…' },
          originalIndex: 0,
        },
        ...tail.map((item, idx) => ({
          item,
          originalIndex: items.length - tailCount + idx,
        })),
      ];
    },
    [items, maxItems]
  );

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{
        flexGrow: 1,
        minWidth: '0px',
        '& .MuiBreadcrumbs-ol': {
          flexWrap: 'wrap',
          alignItems: 'center',
          rowGap: '0.5px',
        },
        '& .MuiBreadcrumbs-separator': {
          mx: '0.75px',
          color: theme.palette.action.disabled,
        },
      }}
    >
      {visibleItems.map(({ item, originalIndex }, idx) => {
        const isLast = idx === visibleItems.length - 1;
        const isRoot = originalIndex === 0 && item.name !== '…';
        const isEllipsis = item.name === '…';

        const label = isRoot
          ? ''
          : isEllipsis
          ? '…'
          : item.name;

        const icon = isEllipsis
          ? undefined
          : isRoot
          ? <HomeIcon fontSize="small" />
          : <FolderIcon fontSize="small" />;

        const chipWidth =
          isEllipsis || isRoot
            ? '60px'
            : isTablet
            ? '160px'
            : '180px';

        const commonProps = {
          key: `${item.id ?? 'root'}-${originalIndex}`,
          label,
          icon,
          sx: {
            width: chipWidth,
            maxWidth: chipWidth,
            '& .MuiChip-icon': {
              marginLeft: isRoot ? '16px' : '4px',
            },
            '& .MuiChip-label': {
              maxWidth: isTablet ? '120px' : `130px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          },
        } as const;

        if (isLast) {
          return (
            <StyledBreadcrumb
              {...commonProps}
              clickable={false}
              variant="filled"
              color="primary"
            />
          );
        }

        return (
          <StyledBreadcrumb
            {...commonProps}
            variant="outlined"
            color="default"
            onClick={() => {
              if (item.name === '…') {
                const parentIndex = Math.max(0, items.length - 2);
                onBreadcrumbClick(parentIndex);
              } else {
                onBreadcrumbClick(originalIndex);
              }
            }}
          />
        );
      })}
    </Breadcrumbs>
  );
};

export default FileBreadcrumbs;


