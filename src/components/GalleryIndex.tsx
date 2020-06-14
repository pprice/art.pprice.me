import { FunctionComponent, useMemo } from "react";
import { getGalleryIndex } from "@/gallery";
import { List, ListItem, ListItemText, Box, makeStyles, createStyles, Theme } from "@material-ui/core";
import Link from "next/link";

type Item = { name: string; url: string };
type Group = { name: string; children: Item[] };

function listToGroups(list: string[]): Group[] {
  const mapped = list
    .map((i) => {
      const [root, ...rest] = i.split("/").filter((i) => i !== ".");

      return { name: root, rest };
    })
    .reduce((acc, i) => {
      if (!acc[i.name]) {
        acc[i.name] = { name: i.name, children: [] };
      }

      acc[i.name].children.push({
        name: i.rest.join("/"),
        url: `/a/${i.name}/${i.rest.join("/")}`,
      });

      return acc;
    }, {} as { [key: string]: Group });

  return Object.values(mapped);
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cap: {
      textTransform: "capitalize",
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
);

export const GalleryIndex: FunctionComponent = () => {
  const index = useMemo(() => listToGroups(getGalleryIndex()), []);
  const classes = useStyles();

  return (
    <>
      {index.map((group) => (
        <Box p={1} key={group.name}>
          <List component="nav" dense>
            <ListItem className={classes.cap}>
              <ListItemText primary={group.name} />
            </ListItem>
            {group.children.map((child) => (
              <ListItem button key={child.url} className={classes.nested}>
                <Link href={child.url}>
                  <ListItemText primary={child.name} />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </>
  );
};
